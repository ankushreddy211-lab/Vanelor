import { describe, expect, it } from "vitest";
import { can, type RoleName } from "../permissions";

describe("can() — RBAC permission matrix (architecture §10)", () => {
  it("guest (no roles) is denied every action", () => {
    expect(can([], "reservation:create")).toBe(false);
    expect(can([], "cms:manage")).toBe(false);
    expect(can([], "catalog:manage")).toBe(false);
  });

  it("CUSTOMER can reserve and manage their own data, nothing else", () => {
    const roles: RoleName[] = ["CUSTOMER"];
    expect(can(roles, "reservation:create")).toBe(true);
    expect(can(roles, "reservation:view_own")).toBe(true);
    expect(can(roles, "address:manage_own")).toBe(true);

    expect(can(roles, "catalog:manage")).toBe(false);
    expect(can(roles, "cms:manage")).toBe(false);
    expect(can(roles, "reservation:override")).toBe(false);
    expect(can(roles, "payment:refund")).toBe(false);
  });

  it("EDITORIAL can manage CMS but explicitly cannot touch inventory or pricing (architecture §10)", () => {
    const roles: RoleName[] = ["EDITORIAL"];
    expect(can(roles, "cms:manage")).toBe(true);
    expect(can(roles, "catalog:edit_copy")).toBe(true);

    expect(can(roles, "inventory:manage")).toBe(false);
    expect(can(roles, "catalog:manage")).toBe(false);
    expect(can(roles, "reservation:override")).toBe(false);
  });

  it("CATALOG_MANAGER manages pieces/variants/drops but not reservations or payments", () => {
    const roles: RoleName[] = ["CATALOG_MANAGER"];
    expect(can(roles, "catalog:manage")).toBe(true);
    expect(can(roles, "drop:schedule")).toBe(true);
    expect(can(roles, "inventory:manage")).toBe(true);

    expect(can(roles, "reservation:override")).toBe(false);
    expect(can(roles, "payment:refund")).toBe(false);
    expect(can(roles, "cms:manage")).toBe(false);
  });

  it("OPS manages reservations/shipping and can revoke sessions but not payments or catalog", () => {
    const roles: RoleName[] = ["OPS"];
    expect(can(roles, "reservation:manage")).toBe(true);
    expect(can(roles, "reservation:override")).toBe(true);
    expect(can(roles, "shipping:manage")).toBe(true);
    expect(can(roles, "session:revoke")).toBe(true);

    expect(can(roles, "payment:refund")).toBe(false);
    expect(can(roles, "catalog:manage")).toBe(false);
    expect(can(roles, "cms:manage")).toBe(false);
  });

  it("FINANCE can view/refund payments only", () => {
    const roles: RoleName[] = ["FINANCE"];
    expect(can(roles, "payment:view")).toBe(true);
    expect(can(roles, "payment:refund")).toBe(true);

    expect(can(roles, "reservation:override")).toBe(false);
    expect(can(roles, "catalog:manage")).toBe(false);
    expect(can(roles, "session:revoke")).toBe(false);
  });

  it("ADMIN can do everything, including actions no other role has", () => {
    const roles: RoleName[] = ["ADMIN"];
    expect(can(roles, "reservation:override")).toBe(true);
    expect(can(roles, "catalog:manage")).toBe(true);
    expect(can(roles, "cms:manage")).toBe(true);
    expect(can(roles, "payment:refund")).toBe(true);
    expect(can(roles, "session:revoke")).toBe(true);
    expect(can(roles, "rbac:manage_roles")).toBe(true); // not explicitly listed anywhere — wildcard covers it
  });

  it("a user holding multiple roles gets the union of their grants (architecture §10: 'a small team wearing several hats')", () => {
    const roles: RoleName[] = ["EDITORIAL", "OPS"];
    expect(can(roles, "cms:manage")).toBe(true); // from EDITORIAL
    expect(can(roles, "reservation:override")).toBe(true); // from OPS
    expect(can(roles, "payment:refund")).toBe(false); // neither role grants this
  });

  it("admin:access (Phase 6): every staff role can reach the admin hub, CUSTOMER and guest cannot", () => {
    expect(can(["EDITORIAL"], "admin:access")).toBe(true);
    expect(can(["CATALOG_MANAGER"], "admin:access")).toBe(true);
    expect(can(["OPS"], "admin:access")).toBe(true);
    expect(can(["FINANCE"], "admin:access")).toBe(true);
    expect(can(["ADMIN"], "admin:access")).toBe(true);

    expect(can(["CUSTOMER"], "admin:access")).toBe(false);
    expect(can([], "admin:access")).toBe(false);
  });
});
