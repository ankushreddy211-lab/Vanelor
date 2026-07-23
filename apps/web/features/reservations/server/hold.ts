import { prisma } from "@valenor/db";
import { computeAvailableQuantity, type LedgerEntry } from "@valenor/domain";
import { withLock } from "../../../lib/redis/lock";
import { invalidateAvailabilityCache } from "./inventory";
import { assertDropIsLive } from "../../drops/server/gating";
import { InsufficientStockError, VariantNotInDropError } from "./errors";
import type { ReservationTxClient } from "./tx-types";

const LOCK_TTL_MS = 2000; // architecture §11.1: "short TTL, ~2s"
const HOLD_DURATION_MS = 1000 * 60 * 10; // 10-minute checkout window

/**
 * Architecture §11.1, step by step:
 *   1. Request arrives → acquire a Redis lock keyed on variant:{id}
 *   2. Inside the lock: read current availability, and if available,
 *      write a HOLD ledger entry + create the Reservation/ReservationLine
 *      in a single Postgres transaction
 *   3. Release the lock
 *
 * The availability read inside the lock is a fresh DB read, NOT the
 * cached value from inventory.ts's getAvailableQuantity — the cache is
 * for display/pre-flight only. Inside the lock, staleness of even a
 * couple seconds is exactly the oversell bug this whole mechanism exists
 * to prevent, so this reads the ledger directly.
 *
 * This is deliberately the entire hot path and nothing else — no email
 * dispatch, no payment intent creation, none of the confirmation saga
 * (that's confirm.ts, called later, outside any lock). Architecture's own
 * risk note: "keeping the hot path... as small and fast as possible —
 * critical for drop-moment traffic spikes."
 */
export async function createHold(params: {
  userId: string;
  dropSlug: string;
  variantId: string;
  quantity: number;
}): Promise<{ reservationId: string; expiresAt: Date }> {
  const { userId, dropSlug, variantId, quantity } = params;

  // Gate first, outside the lock — no point locking a variant for a drop
  // that isn't even live. Reuses the exact function from Phase 6; this is
  // the real call site that function was always waiting for.
  const { dropId } = await assertDropIsLive(dropSlug);

  // Integrity check: the variant must actually belong to a piece attached
  // to this drop — otherwise a crafted request could hold inventory for a
  // piece that was never announced as part of this release.
  const membership = await prisma.dropPiece.findFirst({
    where: { dropId, piece: { variants: { some: { id: variantId } } } },
    select: { id: true },
  });
  if (!membership) {
    throw new VariantNotInDropError(variantId, dropSlug);
  }

  return withLock(`variant:${variantId}`, LOCK_TTL_MS, async () => {
    const variant = await prisma.variant.findUniqueOrThrow({
      where: { id: variantId },
      select: { price: true, ledgerEntries: { select: { type: true, quantity: true } } },
    });

    const available = computeAvailableQuantity(variant.ledgerEntries as LedgerEntry[]);
    if (available < quantity) {
      throw new InsufficientStockError(variantId);
    }

    const expiresAt = new Date(Date.now() + HOLD_DURATION_MS);

    const reservation = await prisma.$transaction(async (tx: ReservationTxClient) => {
      const created = await tx.reservation.create({
        data: {
          userId,
          status: "HELD",
          expiresAt,
          lines: {
            create: [{ variantId, quantity, unitPriceSnapshot: variant.price }],
          },
          events: {
            create: [{ fromStatus: "PENDING", toStatus: "HELD" }],
          },
        },
        select: { id: true },
      });

      await tx.inventoryLedgerEntry.create({
        data: { variantId, type: "HOLD", quantity, reservationId: created.id },
      });

      return created;
    });

    await invalidateAvailabilityCache(variantId);

    return { reservationId: reservation.id, expiresAt };
  });
}
