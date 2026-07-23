import { describe, expect, it } from "vitest";
import { computeAvailableQuantity, hasSufficientStock, type LedgerEntry } from "../ledger";

describe("computeAvailableQuantity (architecture §7.2 append-only ledger)", () => {
  it("is zero for no entries", () => {
    expect(computeAvailableQuantity([])).toBe(0);
  });

  it("RESTOCK adds to availability", () => {
    expect(computeAvailableQuantity([{ type: "RESTOCK", quantity: 10 }])).toBe(10);
  });

  it("HOLD reduces availability", () => {
    const entries: LedgerEntry[] = [
      { type: "RESTOCK", quantity: 10 },
      { type: "HOLD", quantity: 3 },
    ];
    expect(computeAvailableQuantity(entries)).toBe(7);
  });

  it("RELEASE restores availability after a HOLD", () => {
    const entries: LedgerEntry[] = [
      { type: "RESTOCK", quantity: 10 },
      { type: "HOLD", quantity: 3 },
      { type: "RELEASE", quantity: 3 },
    ];
    expect(computeAvailableQuantity(entries)).toBe(10);
  });

  it("SELL has no additional effect beyond the HOLD that preceded it — the unit stays permanently unavailable", () => {
    const entries: LedgerEntry[] = [
      { type: "RESTOCK", quantity: 10 },
      { type: "HOLD", quantity: 3 },
      { type: "SELL", quantity: 3 },
    ];
    expect(computeAvailableQuantity(entries)).toBe(7); // NOT 4 — SELL doesn't double-deduct
  });

  it("ADJUSTMENT can raise or lower availability via a signed quantity", () => {
    expect(computeAvailableQuantity([{ type: "RESTOCK", quantity: 10 }, { type: "ADJUSTMENT", quantity: -2 }])).toBe(8);
    expect(computeAvailableQuantity([{ type: "RESTOCK", quantity: 10 }, { type: "ADJUSTMENT", quantity: 5 }])).toBe(15);
  });

  it("a realistic mixed sequence resolves correctly", () => {
    const entries: LedgerEntry[] = [
      { type: "RESTOCK", quantity: 20 },
      { type: "HOLD", quantity: 5 }, // buyer A holds 5
      { type: "HOLD", quantity: 3 }, // buyer B holds 3
      { type: "SELL", quantity: 5 }, // buyer A completes purchase
      { type: "RELEASE", quantity: 3 }, // buyer B's hold expires
      { type: "ADJUSTMENT", quantity: -1 }, // one unit found damaged
    ];
    // 20 - 5 (A held, now sold, never released) - 3 (B held) + 3 (B released) - 1 (adjustment) = 14
    expect(computeAvailableQuantity(entries)).toBe(14);
  });
});

describe("hasSufficientStock", () => {
  it("is true when requested quantity is at or under availability", () => {
    const entries: LedgerEntry[] = [{ type: "RESTOCK", quantity: 5 }];
    expect(hasSufficientStock(entries, 5)).toBe(true);
    expect(hasSufficientStock(entries, 3)).toBe(true);
  });

  it("is false when requested quantity exceeds availability", () => {
    const entries: LedgerEntry[] = [{ type: "RESTOCK", quantity: 5 }];
    expect(hasSufficientStock(entries, 6)).toBe(false);
  });

  it("is false against zero stock", () => {
    expect(hasSufficientStock([], 1)).toBe(false);
  });
});

describe("oversell simulation — the core correctness property this phase exists to guarantee", () => {
  /**
   * This doesn't exercise the real Redis lock or Postgres transaction (that
   * needs a live environment — see README). What it does verify: if every
   * hold attempt checks `hasSufficientStock` against the ledger state as
   * it stood immediately before its own write, and writes are effectively
   * serialized (which is what the Redis lock in
   * features/reservations/server/hold.ts guarantees), then the number of
   * successful holds can never exceed available stock — the ledger
   * arithmetic itself has no oversell bug. This is the pure-logic half of
   * the correctness proof; the concurrency-safety half is an environment
   * concern, not a math concern.
   */
  it("processing N attempts serially against limited stock never exceeds available stock, regardless of arrival order", () => {
    const stock = 3;
    const entries: LedgerEntry[] = [{ type: "RESTOCK", quantity: stock }];
    const attempts = 10; // far more demand than supply — the classic drop-day scenario
    let successes = 0;

    for (let i = 0; i < attempts; i++) {
      if (hasSufficientStock(entries, 1)) {
        entries.push({ type: "HOLD", quantity: 1 });
        successes++;
      }
    }

    expect(successes).toBe(stock);
    expect(computeAvailableQuantity(entries)).toBe(0);
  });

  it("holds interleaved with releases still never oversells", () => {
    const entries: LedgerEntry[] = [{ type: "RESTOCK", quantity: 2 }];

    const attempt = () => {
      const ok = hasSufficientStock(entries, 1);
      if (ok) entries.push({ type: "HOLD", quantity: 1 });
      return ok;
    };

    expect(attempt()).toBe(true); // hold 1/2
    expect(attempt()).toBe(true); // hold 2/2
    expect(attempt()).toBe(false); // stock exhausted
    entries.push({ type: "RELEASE", quantity: 1 }); // one hold expires
    expect(attempt()).toBe(true); // released unit can be re-held
    expect(attempt()).toBe(false); // exhausted again

    expect(computeAvailableQuantity(entries)).toBe(0);
  });
});
