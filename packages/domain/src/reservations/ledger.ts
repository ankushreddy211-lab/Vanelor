/**
 * Inventory is an append-only ledger (architecture §7.2), never a mutable
 * stock integer — this is the pure arithmetic that derives "available
 * right now" from a list of entries. No DB here; the DB-backed wrapper
 * (features/reservations/server/inventory.ts) supplies the rows.
 *
 * Semantics, made explicit because the schema alone doesn't say this:
 *   available = Σ RESTOCK + Σ RELEASE + Σ ADJUSTMENT(signed) − Σ HOLD
 * SELL entries do NOT further reduce availability — the HOLD that preceded
 * a sale already did that. SELL exists purely as an audit-trail record
 * ("this specific hold converted into a sale," never released). A unit
 * becomes permanently unavailable the moment it's held and sold, simply by
 * never receiving a RELEASE entry.
 */

export type LedgerType = "RESTOCK" | "HOLD" | "RELEASE" | "SELL" | "ADJUSTMENT";

export interface LedgerEntry {
  type: LedgerType;
  quantity: number; // always a positive count; ADJUSTMENT may be negative to represent a write-down
}

export function computeAvailableQuantity(entries: readonly LedgerEntry[]): number {
  let available = 0;
  for (const entry of entries) {
    switch (entry.type) {
      case "RESTOCK":
      case "RELEASE":
        available += entry.quantity;
        break;
      case "HOLD":
        available -= entry.quantity;
        break;
      case "ADJUSTMENT":
        available += entry.quantity; // signed — a write-down passes a negative quantity
        break;
      case "SELL":
        break; // no further effect — see module comment
    }
  }
  return available;
}

export function hasSufficientStock(entries: readonly LedgerEntry[], requestedQuantity: number): boolean {
  return computeAvailableQuantity(entries) >= requestedQuantity;
}
