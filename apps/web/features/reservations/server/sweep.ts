import { prisma } from "@valenor/db";
import { isReservationExpired } from "@valenor/domain";
import { invalidateAvailabilityCache } from "./inventory";
import { logger } from "../../../lib/observability/logger";
import type { ReservationTxClient } from "./tx-types";

/**
 * Architecture §11.1: "A background job... scans for HELD/AWAITING_PAYMENT
 * reservations past expiresAt and writes RELEASE ledger entries,
 * transitioning reservation to EXPIRED." Triggered on a schedule — see
 * app/api/cron/reservations-sweep/route.ts — same cron-hit-route pattern
 * as the Drop status sync (Phase 6's README explains that choice; it
 * applies here too, though this job needs to run far more often — every
 * ~30s, not once a minute, since a stuck 10-minute hold on a
 * single-digit-stock variant blocks real demand for real time).
 */
export async function sweepExpiredReservations(now: Date = new Date()): Promise<{ expiredCount: number }> {
  const candidates: Array<{
    id: string;
    status: "HELD" | "AWAITING_PAYMENT";
    expiresAt: Date;
    lines: Array<{ variantId: string; quantity: number }>;
  }> = await prisma.reservation.findMany({
    where: { status: { in: ["HELD", "AWAITING_PAYMENT"] } },
    select: { id: true, status: true, expiresAt: true, lines: { select: { variantId: true, quantity: true } } },
  });

  const expired = candidates.filter((r) => isReservationExpired(r.expiresAt, now));
  const touchedVariantIds = new Set<string>();

  for (const reservation of expired) {
    await prisma.$transaction(async (tx: ReservationTxClient) => {
      await tx.reservation.update({ where: { id: reservation.id }, data: { status: "EXPIRED" } });
      await tx.reservationEvent.create({
        data: { reservationId: reservation.id, fromStatus: reservation.status, toStatus: "EXPIRED" },
      });
      for (const line of reservation.lines) {
        await tx.inventoryLedgerEntry.create({
          data: { variantId: line.variantId, type: "RELEASE", quantity: line.quantity, reservationId: reservation.id },
        });
        touchedVariantIds.add(line.variantId);
      }
    });
    logger.info({ reservationId: reservation.id }, "Reservation expired and released");
  }

  await Promise.all(Array.from(touchedVariantIds).map((id) => invalidateAvailabilityCache(id)));

  return { expiredCount: expired.length };
}
