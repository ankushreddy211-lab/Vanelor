import { redis } from "./redis";
// @ts-ignore
import { prisma } from "@valenor/db";

const RESERVATION_TTL = 300; // 5 minutes

export async function lockReservation(variantId: string, userId: string) {
  const lockKey = `reserve:variant:${variantId}`;
  
  // Attempt to claim one item of inventory in Redis before hitting Postgres
  const currentStock = await redis.decr(`inventory:${variantId}`);
  
  if (currentStock < 0) {
    // Revert if out of stock
    await redis.incr(`inventory:${variantId}`);
    return { success: false, reason: "OUT_OF_STOCK" };
  }

  // Set the 5-minute hold for this user
  const userHoldKey = `hold:${userId}:${variantId}`;
  await redis.setex(userHoldKey, RESERVATION_TTL, "held");

  // The worker process (Phase 9) will reconcile this Redis lock with Postgres
  return { success: true, ttl: RESERVATION_TTL };
}

export async function confirmAcquisition(userId: string, variantId: string) {
  const userHoldKey = `hold:${userId}:${variantId}`;
  const hold = await redis.get(userHoldKey);
  
  if (!hold) {
    return { success: false, reason: "RESERVATION_EXPIRED" };
  }

  // Process payment/address (mocked), then write definitively to Postgres
  await prisma.reservation.create({
    data: {
      userId,
      status: "CONFIRMED",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Original expiry
    }
  });

  // Release the Redis hold as it's now permanently confirmed in Postgres
  await redis.del(userHoldKey);

  // Here we trigger the Resend confirmation email (Phase 7)
  return { success: true };
}
