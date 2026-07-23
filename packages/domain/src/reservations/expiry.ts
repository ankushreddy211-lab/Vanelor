/**
 * Same discipline as the Drop engine (Phase 6): `now` is a required
 * parameter, never defaulted internally, so every call site visibly reads
 * a server-obtained clock and tests can pin exact instants.
 */
export function isReservationExpired(expiresAt: Date, now: Date): boolean {
  return now.getTime() >= expiresAt.getTime();
}
