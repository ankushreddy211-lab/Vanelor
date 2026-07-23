"use client";

import { useState, useTransition } from "react";
import { Text, Button } from "@valenor/design-system";
import { assignRole, revokeRole, forceLogout } from "./actions";
import type { RoleName } from "../../../../lib/auth/rbac";

const ALL_ROLES: RoleName[] = ["CUSTOMER", "EDITORIAL", "CATALOG_MANAGER", "OPS", "FINANCE", "ADMIN"];

export function UserRoleRow({
  userId,
  email,
  currentRoles,
}: {
  userId: string;
  email: string | null;
  currentRoles: RoleName[];
}) {
  const [pending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<RoleName>("CUSTOMER");
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3 border-b border-border py-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Text role="bodySm" as="p" className="text-fg">
          {email ?? userId}
        </Text>
        <Text role="caption" as="p">
          {currentRoles.length > 0 ? currentRoles.join(", ") : "no roles (guest-equivalent)"}
        </Text>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedRole}
          onChange={(event) => setSelectedRole(event.target.value as RoleName)}
          className="h-9 rounded-sm border border-border bg-transparent px-2 text-sm text-fg"
        >
          {ALL_ROLES.map((role) => (
            <option key={role} value={role} className="bg-bg text-fg">
              {role}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await assignRole(userId, selectedRole);
              setLastMessage(`Granted ${selectedRole}`);
            })
          }
        >
          Grant
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await revokeRole(userId, selectedRole);
              setLastMessage(`Revoked ${selectedRole}`);
            })
          }
        >
          Revoke
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const count = await forceLogout(userId);
              setLastMessage(`Revoked ${count ?? 0} session(s)`);
            })
          }
        >
          Force logout
        </Button>
      </div>

      {lastMessage && (
        <Text role="caption" as="p" className="text-accent-strong">
          {lastMessage}
        </Text>
      )}
    </div>
  );
}
