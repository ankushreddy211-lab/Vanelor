import Redis from "ioredis";
import { env } from "../env";

/**
 * Same dev-hot-reload-safe singleton pattern as @valenor/db's PrismaClient
 * singleton. `lazyConnect: true` means the actual TCP connection happens
 * on the first real command, not at import time — matters for this
 * sandbox specifically (see README): importing this module never fails
 * even without a reachable Redis; only calling a command does.
 */
const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
  });

if (env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
