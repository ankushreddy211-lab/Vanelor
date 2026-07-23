import { prisma } from "@valenor/db";
import { assertValidTransition, type ReservationStatus } from "@valenor/domain";
import { invalidateAvailabilityCache } from "./inventory";
import { ReservationNotFoundError } from "./errors";
import type { ReservationTxClient } from "./tx-types";

/**
 * User- or admin-initiated cancellation. Writes RELEASE ledger entries for
 * every line so the stock actually becomes available again — this is the
 * same release mechanism the expiry sweeper (sweep.ts) uses, just
 * triggered explicitly instead of by a timer.
 */
export async function cancelReservation(reservationId: string): Promise<void> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: { status: true, lines: { select: { variantId: true, quantity: true } } },
  });
  if (!reservation) throw new ReservationNotFoundError(reservationId);

  const fromStatus = reservation.status as ReservationStatus;
  assertValidTransition(fromStatus, "CANCELLED");

  await prisma.$transaction(async (tx: ReservationTxClient) => {
    await tx.reservation.update({ where: { id: reservationId }, data: { status: "CANCELLED" } });
    await tx.reservationEvent.create({
      data: { reservationId, fromStatus, toStatus: "CANCELLED" },
    });
    for (const line of reservation.lines) {
      await tx.inventoryLedgerEntry.create({
        data: { variantId: line.variantId, type: "RELEASE", quantity: line.quantity, reservationId },
      });
    }
  });

  await Promise.all(reservation.lines.map((line: { variantId: string }) => invalidateAvailabilityCache(line.variantId)));
}
