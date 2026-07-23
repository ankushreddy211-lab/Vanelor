import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { env } from "../../../../lib/env";
import { logger } from "../../../../lib/observability/logger";
import { sweepExpiredReservations } from "../../../../features/reservations/server/sweep";

/**
 * Same cron-hit-route pattern and rationale as /api/cron/drops-sync
 * (Phase 6's README). This one should run more often — every ~30s is
 * reasonable — since a stuck hold on a low-stock variant blocks real
 * demand for real time until it's released.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { expiredCount } = await sweepExpiredReservations();

  if (expiredCount > 0) {
    revalidatePath("/admin/reservations");
  }

  logger.info({ expiredCount }, "Reservation expiry sweep complete");

  return NextResponse.json({ status: "ok", expiredCount });
}
