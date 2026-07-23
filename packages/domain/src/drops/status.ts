/**
 * Drop state machine: SCHEDULED → LIVE → ENDED (architecture §11.2).
 *
 * Everything here is a pure function of (liveAt, endsAt, now). This is
 * deliberate: architecture §11.2's own risk note says "mitigate with
 * server-authoritative time checks exclusively, never trusting client
 * clocks." The safest way to honor that is to never persist a
 * trusted-until-next-refresh status for gating decisions — always
 * recompute from the current server clock at the moment it matters. The
 * `status` column on the `Drop` Prisma model is a *cache* for
 * listing/sorting/display, kept approximately in sync by a periodic job
 * (see apps/web's drops sync route) — never the source of truth for
 * whether a reservation attempt should be allowed.
 */

export type DropStatus = "SCHEDULED" | "LIVE" | "ENDED";

export interface DropTiming {
  liveAt: Date;
  endsAt: Date;
}

export class InvalidDropTimingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDropTimingError";
  }
}

/**
 * The one hard invariant a Drop's schedule must satisfy. Deliberately does
 * NOT reject a `liveAt` in the past — admin tooling needs to create
 * back-dated/test drops, and "you scheduled this in the past" is a warning
 * a human should judge, not a rule this function should enforce.
 */
export function assertValidDropTiming(timing: DropTiming): void {
  if (timing.endsAt <= timing.liveAt) {
    throw new InvalidDropTimingError("endsAt must be after liveAt");
  }
}

/**
 * Ground truth. `now` is a required parameter, not `new Date()` defaulted
 * internally — every call site should be passing a server-obtained clock
 * value explicitly, so it's visible at the call site that this is a
 * server-authoritative check, and so tests can pin exact instants without
 * relying on timers.
 */
export function computeDropStatus(timing: DropTiming, now: Date): DropStatus {
  if (now.getTime() < timing.liveAt.getTime()) return "SCHEDULED";
  if (now.getTime() < timing.endsAt.getTime()) return "LIVE";
  return "ENDED";
}

export function isDropLive(timing: DropTiming, now: Date): boolean {
  return computeDropStatus(timing, now) === "LIVE";
}

/**
 * Pure diffing logic for the sync job: given a set of drops with their
 * currently-stored status and their timing, returns only the ones whose
 * computed status disagrees with what's stored — i.e. the minimal set that
 * actually needs a database write and a page revalidation. The DB-backed
 * wrapper (apps/web) supplies the rows and applies the writes; this
 * function contains the only logic worth unit-testing exhaustively.
 */
export interface DropStatusRecord extends DropTiming {
  id: string;
  slug: string;
  storedStatus: DropStatus;
}

export interface DropStatusChange {
  id: string;
  slug: string;
  from: DropStatus;
  to: DropStatus;
}

export function computeStatusChanges(drops: readonly DropStatusRecord[], now: Date): DropStatusChange[] {
  const changes: DropStatusChange[] = [];
  for (const drop of drops) {
    const computed = computeDropStatus(drop, now);
    if (computed !== drop.storedStatus) {
      changes.push({ id: drop.id, slug: drop.slug, from: drop.storedStatus, to: computed });
    }
  }
  return changes;
}
