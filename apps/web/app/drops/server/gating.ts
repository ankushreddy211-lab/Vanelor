import { prisma } from "@valenor/db";
import { computeDropStatus } from "@valenor/domain";
import { DropNotFoundError, DropNotLiveError } from "./errors";

/**
 * The actual gate. Deliberately re-fetches the row and recomputes status
 * from `liveAt`/`endsAt` against the server clock at call time — never
 * trusts the cached `status` column, never trusts anything the client
 * sent. This is what architecture §11.2 means by "always re-validated
 * server-side": Phase 7's reservation-creation flow is expected to call
 * this as its first step, before acquiring the Redis lock or touching
 * inventory.
 */
export async function assertDropIsLive(dropSlug: string): Promise<{ dropId: string }> {
  const drop = await prisma.drop.findUnique({
    where: { slug: dropSlug },
    select: { id: true, slug: true, liveAt: true, endsAt: true },
  });

  if (!drop) {
    throw new DropNotFoundError(dropSlug);
  }

  const now = new Date(); // server clock, read once, right before the decision
  const status = computeDropStatus({ liveAt: drop.liveAt, endsAt: drop.endsAt }, now);

  if (status !== "LIVE") {
    throw new DropNotLiveError(dropSlug, status);
  }

  return { dropId: drop.id };
}
