import { prisma } from "@valenor/db";
import { assertCanForUser } from "./rbac";

/**
 * Revokes every active session for a user — admin-forced logout or
 * account-compromise response (architecture §9). Implemented as a direct
 * delete against the `Session` table rather than a Better Auth admin-plugin
 * call: Better Auth does expose session-management endpoints, but a direct
 * delete against a table we own and control is simpler to reason about and
 * to unit-test than depending on a specific plugin's API surface. Either
 * approach revokes the same rows, since Better Auth reads sessions from
 * this exact table via the Prisma adapter.
 */
export async function revokeAllSessionsForUser(
  callerUserId: string,
  targetUserId: string
): Promise<{ revokedCount: number }> {
  await assertCanForUser(callerUserId, "session:revoke");
  const result = await prisma.session.deleteMany({ where: { userId: targetUserId } });
  return { revokedCount: result.count };
}
