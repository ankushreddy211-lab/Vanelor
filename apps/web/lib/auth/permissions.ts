/**
 * Role names mirror the Prisma `RoleName` enum. Kept as a plain string
 * union here rather than imported from `@prisma/client` so this file has
 * zero dependencies — no generated Prisma client needed to type-check or
 * to test it.
 *
 * Permission matrix is a direct translation of architecture §10's role
 * table plus the domain-ownership boundaries from §6 (e.g. EDITORIAL can
 * manage CMS content but explicitly cannot touch inventory or pricing).
 * `guest` isn't a key here — no roles at all is the guest case, handled
 * by the caller before this matrix is consulted.
 */
export type RoleName = "CUSTOMER" | "EDITORIAL" | "CATALOG_MANAGER" | "OPS" | "FINANCE" | "ADMIN";

const permissionMatrix: Record<RoleName, ReadonlySet<string>> = {
  CUSTOMER: new Set(["reservation:create", "reservation:view_own", "address:manage_own"]),
  EDITORIAL: new Set(["admin:access", "cms:manage", "catalog:edit_copy"]),
  CATALOG_MANAGER: new Set(["admin:access", "catalog:manage", "drop:schedule", "inventory:manage"]),
  OPS: new Set(["admin:access", "reservation:manage", "reservation:override", "shipping:manage", "session:revoke"]),
  FINANCE: new Set(["admin:access", "payment:view", "payment:refund"]),
  ADMIN: new Set(["*"]), // full access, including role management and session revocation
};

export function can(roles: readonly RoleName[], action: string): boolean {
  return roles.some((role) => {
    const grants = permissionMatrix[role];
    return grants.has("*") || grants.has(action);
  });
}
