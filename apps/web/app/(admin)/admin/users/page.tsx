import { redirect } from "next/navigation";
import { prisma } from "@valenor/db";
import { Text } from "@valenor/design-system";
import { getSession, NotAuthorizedError } from "../../../../lib/auth/session";
import { assertCanForUser, type RoleName } from "../../../../lib/auth/rbac";
import { UserRoleRow } from "./UserRoleRow";

/**
 * Minimal role-assignment tooling, per Phase 4 scope ("role assignment
 * admin tooling (minimal)"). Full user management (search, pagination,
 * activity history) is Phase 8.
 */
export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in?from=/admin/users");
  }

  try {
    await assertCanForUser(session.userId, "rbac:manage_roles");
  } catch (error) {
    if (error instanceof NotAuthorizedError) {
      redirect("/admin");
    }
    throw error;
  }

  interface UserWithRoles {
    id: string;
    email: string | null;
    roles: Array<{ role: { name: string } }>;
  }

  const users: UserWithRoles[] = await prisma.user.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { roles: { include: { role: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Text role="label" as="p">
        Admin
      </Text>
      <Text role="heading" as="h1" className="mt-4">
        Roles
      </Text>
      <Text role="body" as="p" className="mt-4 text-fg-muted">
        Grant/revoke roles per architecture §10. Every action here re-checks
        authorization server-side, independent of this page&apos;s own gate.
      </Text>

      <div className="mt-10">
        {users.length === 0 && (
          <Text role="bodySm" as="p" className="text-fg-muted">
            No users yet.
          </Text>
        )}
        {users.map((user) => (
          <UserRoleRow
            key={user.id}
            userId={user.id}
            email={user.email}
            currentRoles={user.roles.map((r) => r.role.name as RoleName)}
          />
        ))}
      </div>
    </main>
  );
}
