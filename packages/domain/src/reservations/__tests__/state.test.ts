import { describe, expect, it } from "vitest";
import { canTransition, assertValidTransition, isTerminal, InvalidReservationTransitionError, type ReservationStatus } from "../state";

const ALL_STATUSES: ReservationStatus[] = ["PENDING", "HELD", "AWAITING_PAYMENT", "CONFIRMED", "EXPIRED", "CANCELLED"];

describe("canTransition (architecture §11.1 state machine)", () => {
  it("allows every valid forward transition", () => {
    expect(canTransition("PENDING", "HELD")).toBe(true);
    expect(canTransition("HELD", "AWAITING_PAYMENT")).toBe(true);
    expect(canTransition("AWAITING_PAYMENT", "CONFIRMED")).toBe(true);
  });

  it("allows expiry from HELD and AWAITING_PAYMENT, not from PENDING", () => {
    expect(canTransition("HELD", "EXPIRED")).toBe(true);
    expect(canTransition("AWAITING_PAYMENT", "EXPIRED")).toBe(true);
    expect(canTransition("PENDING", "EXPIRED")).toBe(false);
  });

  it("allows cancellation from every non-terminal state", () => {
    expect(canTransition("PENDING", "CANCELLED")).toBe(true);
    expect(canTransition("HELD", "CANCELLED")).toBe(true);
    expect(canTransition("AWAITING_PAYMENT", "CANCELLED")).toBe(true);
  });

  it("rejects skipping states (e.g. PENDING straight to CONFIRMED)", () => {
    expect(canTransition("PENDING", "CONFIRMED")).toBe(false);
    expect(canTransition("PENDING", "AWAITING_PAYMENT")).toBe(false);
    expect(canTransition("HELD", "CONFIRMED")).toBe(false);
  });

  it("rejects any transition out of a terminal state", () => {
    for (const terminal of ["CONFIRMED", "EXPIRED", "CANCELLED"] as const) {
      for (const target of ALL_STATUSES) {
        expect(canTransition(terminal, target)).toBe(false);
      }
    }
  });

  it("rejects a transition to the same state (no-op transitions aren't modeled as valid)", () => {
    for (const status of ALL_STATUSES) {
      expect(canTransition(status, status)).toBe(false);
    }
  });
});

describe("assertValidTransition", () => {
  it("does not throw for a valid transition", () => {
    expect(() => assertValidTransition("PENDING", "HELD")).not.toThrow();
  });

  it("throws InvalidReservationTransitionError for an invalid transition", () => {
    expect(() => assertValidTransition("CONFIRMED", "PENDING")).toThrow(InvalidReservationTransitionError);
  });
});

describe("isTerminal", () => {
  it("CONFIRMED, EXPIRED, CANCELLED are terminal", () => {
    expect(isTerminal("CONFIRMED")).toBe(true);
    expect(isTerminal("EXPIRED")).toBe(true);
    expect(isTerminal("CANCELLED")).toBe(true);
  });

  it("PENDING, HELD, AWAITING_PAYMENT are not terminal", () => {
    expect(isTerminal("PENDING")).toBe(false);
    expect(isTerminal("HELD")).toBe(false);
    expect(isTerminal("AWAITING_PAYMENT")).toBe(false);
  });
});
