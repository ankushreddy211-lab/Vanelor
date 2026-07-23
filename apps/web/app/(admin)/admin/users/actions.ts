"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@valenor/db";
import { getSession } from "../../../../lib/auth/session";
import { assertCanForUser, type RoleName } from "../../../../lib/auth/rbac";
import { revokeAllSessionsForUser } from "../../../../lib/auth/revocation";

/**
 * Every action here re-runs its own auth check rather than trusting that
 * only the (already-gated) admin page can reach it. Server actions are
 * callable directly once their reference reaches the client — the page
 * gate keeps them out of casual reach, but it isn't the security boundary,
 * same principle as middleware.ts vs. session.ts.
 */
async function requireCaller(action: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Not signed in");
  }
  await assertCanForUser(session.userId, action);
  return session;
}

export async function assignRole(userId: string, roleName: RoleName) {
  await requireCaller("rbac:manage_roles");

  const role = await prisma.role.upsert({
    where: { name: roleName },
    update: {},
    create: { name: roleName },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId: role.id } },
    update: {},
    create: { userId, roleId: role.id },
  });

  revalidatePath("/admin/users");
}

export async function revokeRole(userId: string, roleName: RoleName) {
  await requireCaller("rbac:manage_roles");

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) return;

  await prisma.userRole.deleteMany({ where: { userId, roleId: role.id } });
  revalidatePath("/admin/users");
}

export async function forceLogout(userId: string) {
  const session = await requireCaller("session:revoke");
  const { revokedCount } = await revokeAllSessionsForUser(session.userId, userId);
  revalidatePath("/admin/users");
  return revokedCount;
}
