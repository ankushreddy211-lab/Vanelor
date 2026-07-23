import { describe, expect, it } from "vitest";
import {
  computeDropStatus,
  isDropLive,
  assertValidDropTiming,
  computeStatusChanges,
  InvalidDropTimingError,
  type DropStatusRecord,
} from "../status";

const liveAt = new Date("2026-08-01T12:00:00.000Z");
const endsAt = new Date("2026-08-08T12:00:00.000Z");
const timing = { liveAt, endsAt };

describe("computeDropStatus (architecture §11.2 state machine)", () => {
  it("is SCHEDULED before liveAt", () => {
    expect(computeDropStatus(timing, new Date("2026-07-31T23:59:59.999Z"))).toBe("SCHEDULED");
  });

  it("is LIVE at the exact liveAt instant — the boundary belongs to LIVE, not SCHEDULED", () => {
    expect(computeDropStatus(timing, liveAt)).toBe("LIVE");
  });

  it("is LIVE one millisecond before endsAt", () => {
    expect(computeDropStatus(timing, new Date(endsAt.getTime() - 1))).toBe("LIVE");
  });

  it("is ENDED at the exact endsAt instant — the boundary belongs to ENDED, not LIVE", () => {
    expect(computeDropStatus(timing, endsAt)).toBe("ENDED");
  });

  it("is ENDED long after endsAt", () => {
    expect(computeDropStatus(timing, new Date("2030-01-01T00:00:00.000Z"))).toBe("ENDED");
  });

  it("is deterministic for the same instant regardless of how many times it's called — no hidden clock reads", () => {
    const now = new Date("2026-08-03T00:00:00.000Z");
    expect(computeDropStatus(timing, now)).toBe(computeDropStatus(timing, now));
  });
});

describe("isDropLive", () => {
  it("agrees with computeDropStatus at every boundary checked above", () => {
    expect(isDropLive(timing, new Date("2026-07-31T23:59:59.999Z"))).toBe(false);
    expect(isDropLive(timing, liveAt)).toBe(true);
    expect(isDropLive(timing, endsAt)).toBe(false);
  });
});

describe("assertValidDropTiming", () => {
  it("accepts endsAt after liveAt", () => {
    expect(() => assertValidDropTiming(timing)).not.toThrow();
  });

  it("rejects endsAt equal to liveAt — a drop must have non-zero duration", () => {
    expect(() => assertValidDropTiming({ liveAt, endsAt: liveAt })).toThrow(InvalidDropTimingError);
  });

  it("rejects endsAt before liveAt", () => {
    expect(() =>
      assertValidDropTiming({ liveAt, endsAt: new Date(liveAt.getTime() - 1000) })
    ).toThrow(InvalidDropTimingError);
  });

  it("does NOT reject a liveAt in the past — admin tooling needs to create back-dated/test drops", () => {
    const past = { liveAt: new Date("2020-01-01"), endsAt: new Date("2020-01-08") };
    expect(() => assertValidDropTiming(past)).not.toThrow();
  });
});

describe("computeStatusChanges — the sync job's core logic", () => {
  const now = new Date("2026-08-03T00:00:00.000Z"); // inside the live window above

  it("returns a change when stored status disagrees with computed status", () => {
    const drops: DropStatusRecord[] = [
      { id: "1", slug: "chapter-four", liveAt, endsAt, storedStatus: "SCHEDULED" },
    ];
    const changes = computeStatusChanges(drops, now);
    expect(changes).toEqual([{ id: "1", slug: "chapter-four", from: "SCHEDULED", to: "LIVE" }]);
  });

  it("returns no change when stored status already matches computed status", () => {
    const drops: DropStatusRecord[] = [
      { id: "1", slug: "chapter-four", liveAt, endsAt, storedStatus: "LIVE" },
    ];
    expect(computeStatusChanges(drops, now)).toEqual([]);
  });

  it("processes a mixed batch and returns only the drops that actually changed", () => {
    const drops: DropStatusRecord[] = [
      { id: "1", slug: "already-live", liveAt, endsAt, storedStatus: "LIVE" }, // no change
      {
        id: "2",
        slug: "should-end",
        liveAt: new Date("2026-07-01"),
        endsAt: new Date("2026-08-01"),
        storedStatus: "LIVE",
      }, // LIVE -> ENDED
      {
        id: "3",
        slug: "still-scheduled",
        liveAt: new Date("2026-12-01"),
        endsAt: new Date("2026-12-08"),
        storedStatus: "SCHEDULED",
      }, // no change
    ];
    const changes = computeStatusChanges(drops, now);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toEqual({ id: "2", slug: "should-end", from: "LIVE", to: "ENDED" });
  });

  it("returns an empty array for an empty batch", () => {
    expect(computeStatusChanges([], now)).toEqual([]);
  });
});
