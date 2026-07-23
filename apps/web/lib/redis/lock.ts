import { randomUUID } from "node:crypto";
import { redis } from "./client";

/**
 * Simple single-instance Redis lock (SET NX PX + a Lua compare-and-delete
 * on release) — not full multi-node Redlock consensus. Architecture §3's
 * stack is a single managed Redis instance (Upstash), not a Redis cluster
 * requiring quorum, so Redlock's extra complexity buys nothing here; this
 * is the right amount of mechanism for the actual deployment target.
 *
 * The release script only deletes the key if its value still matches the
 * token this call wrote — without that check, a lock that outlives its
 * TTL (e.g. a slow request) could delete a *different* caller's
 * newly-acquired lock on the same key. Classic distributed-lock bug this
 * avoids.
 */
const RELEASE_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

export class LockAcquisitionError extends Error {
  constructor(key: string) {
    super(`Could not acquire lock for "${key}" — try again in a moment`);
    this.name = "LockAcquisitionError";
  }
}

/**
 * Acquires a lock on `key`, runs `fn`, releases the lock — even if `fn`
 * throws. Architecture §11.1: "acquire a Redis distributed lock keyed on
 * variant:{id} (short TTL, ~2s)... Release lock." `fn` should be as short
 * as possible; this is the hot path on drop day.
 */
export async function withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const token = randomUUID();
  const acquired = await redis.set(key, token, "PX", ttlMs, "NX");

  if (acquired !== "OK") {
    throw new LockAcquisitionError(key);
  }

  try {
    return await fn();
  } finally {
    await redis.eval(RELEASE_SCRIPT, 1, key, token);
  }
}
