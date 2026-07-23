import { describe, expect, it } from "vitest";
import { isReservationExpired } from "../expiry";

describe("isReservationExpired", () => {
  const expiresAt = new Date("2026-08-01T12:00:00.000Z");

  it("is false before expiresAt", () => {
    expect(isReservationExpired(expiresAt, new Date("2026-08-01T11:59:59.999Z"))).toBe(false);
  });

  it("is true at the exact expiresAt instant", () => {
    expect(isReservationExpired(expiresAt, expiresAt)).toBe(true);
  });

  it("is true after expiresAt", () => {
    expect(isReservationExpired(expiresAt, new Date("2026-08-01T12:00:00.001Z"))).toBe(true);
  });
});
