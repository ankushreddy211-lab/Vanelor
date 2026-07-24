import { describe, expect, it, vi, beforeEach } from "vitest";

const { findManyMock, deleteManyMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  deleteManyMock: vi.fn(),
}));

vi.mock("@valenor/db", () => ({
  prisma: {
    session: { deleteMany: (...args: unknown[]) => deleteManyMock(...args) },
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ getAll: vi.fn(() => []) })),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: async () => ({ data: await findManyMock(), error: null }),
      }),
    }),
  }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = "dummy";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "dummy";

// Imported after the mock so the mocked module is what gets wired in.
const { revokeAllSessionsForUser } = await import("../revocation");

describe("revokeAllSessionsForUser (architecture §9: sessions must be revocable)", () => {
  beforeEach(() => {
    findManyMock.mockReset();
    deleteManyMock.mockReset();
  });

  it("an OPS caller can revoke a user's sessions", async () => {
    findManyMock.mockResolvedValue([{ role: { name: "OPS" } }]);
    deleteManyMock.mockResolvedValue({ count: 3 });

    const result = await revokeAllSessionsForUser("caller-1", "target-user-1");

    expect(deleteManyMock).toHaveBeenCalledWith({ where: { userId: "target-user-1" } });
    expect(result).toEqual({ revokedCount: 3 });
  });

  it("a CUSTOMER caller cannot revoke sessions — throws, and never touches the Session table", async () => {
    findManyMock.mockResolvedValue([{ role: { name: "CUSTOMER" } }]);

    await expect(revokeAllSessionsForUser("caller-1", "target-user-1")).rejects.toThrow(
      "Not authorized to perform: session:revoke"
    );
    expect(deleteManyMock).not.toHaveBeenCalled();
  });

  it("a caller with no roles at all (guest) cannot revoke sessions", async () => {
    findManyMock.mockResolvedValue([]);

    await expect(revokeAllSessionsForUser("caller-1", "target-user-1")).rejects.toThrow(
      "Not authorized to perform: session:revoke"
    );
    expect(deleteManyMock).not.toHaveBeenCalled();
  });
});
