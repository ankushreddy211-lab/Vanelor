import { prisma } from "@valenor/db";
import { computeAvailableQuantity, type LedgerEntry } from "@valenor/domain";
import { redis } from "../../../lib/redis/client";

const CACHE_TTL_SECONDS = 2; // short — architecture §11.1: "cached in Redis with a short TTL invalidated on ledger writes"

function cacheKey(variantId: string) {
  return `inventory:available:${variantId}`;
}

/**
 * Reads all ledger entries for a variant and derives availability via the
 * pure function in @valenor/domain. Cached briefly — a variant's
 * availability is read far more often (every page view, every failed hold
 * attempt) than it changes, so a 2s cache absorbs read load during a drop
 * spike without meaningfully increasing staleness risk. The hold itself
 * (hold.ts) never trusts this cache for the actual write decision inside
 * the lock — it's for display and pre-flight checks only.
 */
export async function getAvailableQuantity(variantId: string): Promise<number> {
  const cached = await redis.get(cacheKey(variantId)).catch(() => null); // cache-read failures degrade to a DB read, never fail the request
  if (cached !== null) {
    return Number(cached);
  }

  const entries: LedgerEntry[] = await prisma.inventoryLedgerEntry.findMany({
    where: { variantId },
    select: { type: true, quantity: true },
  });
  const available = computeAvailableQuantity(entries);

  await redis.set(cacheKey(variantId), available, "EX", CACHE_TTL_SECONDS).catch(() => undefined);
  return available;
}

/** Called immediately after any ledger write so the next read isn't served stale data for the full TTL. */
export async function invalidateAvailabilityCache(variantId: string): Promise<void> {
  await redis.del(cacheKey(variantId)).catch(() => undefined);
}
