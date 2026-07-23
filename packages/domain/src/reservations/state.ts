/**
 * PENDING → HELD → AWAITING_PAYMENT → CONFIRMED
 *                                    ↘ EXPIRED
 *                         ↘ CANCELLED (user or admin initiated)
 * (architecture §11.1)
 */
export type ReservationStatus = "PENDING" | "HELD" | "AWAITING_PAYMENT" | "CONFIRMED" | "EXPIRED" | "CANCELLED";

const VALID_TRANSITIONS: Record<ReservationStatus, ReadonlySet<ReservationStatus>> = {
  PENDING: new Set(["HELD", "CANCELLED"]),
  HELD: new Set(["AWAITING_PAYMENT", "EXPIRED", "CANCELLED"]),
  AWAITING_PAYMENT: new Set(["CONFIRMED", "EXPIRED", "CANCELLED"]),
  CONFIRMED: new Set([]), // terminal
  EXPIRED: new Set([]), // terminal
  CANCELLED: new Set([]), // terminal
};

export class InvalidReservationTransitionError extends Error {
  constructor(from: ReservationStatus, to: ReservationStatus) {
    super(`Cannot transition reservation from ${from} to ${to}`);
    this.name = "InvalidReservationTransitionError";
  }
}

export function canTransition(from: ReservationStatus, to: ReservationStatus): boolean {
  return VALID_TRANSITIONS[from].has(to);
}

export function assertValidTransition(from: ReservationStatus, to: ReservationStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidReservationTransitionError(from, to);
  }
}

export function isTerminal(status: ReservationStatus): boolean {
  return VALID_TRANSITIONS[status].size === 0;
}
