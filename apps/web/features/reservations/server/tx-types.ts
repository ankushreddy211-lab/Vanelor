/**
 * Minimal structural type covering every `tx.<model>.<method>` call used
 * across this feature's transactions. Exists only because this sandbox
 * can't run `prisma generate` (see README) — without a generated client,
 * `$transaction`'s callback parameter has no inferred shape and strict
 * mode flags every property access. This is structurally correct against
 * the real Prisma.TransactionClient too, so nothing changes once
 * `generate` runs for real.
 */
export interface ReservationTxClient {
  reservation: { create: (args: unknown) => Promise<{ id: string }>; update: (args: unknown) => Promise<unknown> };
  reservationEvent: { create: (args: unknown) => Promise<unknown> };
  inventoryLedgerEntry: { create: (args: unknown) => Promise<unknown> };
  paymentAttempt: { update: (args: unknown) => Promise<unknown> };
  order: { create: (args: unknown) => Promise<{ id: string }> };
}
