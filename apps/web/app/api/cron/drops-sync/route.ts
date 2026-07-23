import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { env } from "../../../../lib/env";
import { logger } from "../../../../lib/observability/logger";
import { transitionDropStatuses } from "../../../../features/drops/server/sync";

/**
 * Architecture §11.2: "Drop pages... switch to dynamic/live rendering at
 * liveAt via revalidation triggered by the same scheduler job that 'opens'
 * the drop." This route is that job, meant to be hit on a schedule (Vercel
 * Cron, or a plain system cron curling it with the bearer token below) —
 * not a standalone BullMQ worker process.
 *
 * Why not BullMQ here, when architecture §3 names it as the job runner:
 * BullMQ earns its cost for the reservation-expiry sweeper (Phase 7,
 * frequent, needs a persistent worker reacting to real-time holds). A
 * once-a-minute status tick that only ever reads+writes rows and calls
 * revalidatePath doesn't need a dedicated worker process — a cron-hit
 * route is simpler and "boring" per architecture §2, consistent with the
 * Turborepo-deferral decision from Phase 3's README. Revisit if job
 * complexity grows.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const changes = await transitionDropStatuses();

  for (const change of changes) {
    revalidatePath(`/drops/${change.slug}`);
  }
  revalidatePath("/admin/drops");
  revalidateTag("drops");

  logger.info({ changeCount: changes.length }, "Drop status sync complete");

  return NextResponse.json({ status: "ok", changes });
}
