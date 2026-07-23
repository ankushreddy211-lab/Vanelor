import { headers } from "next/headers";
import { auth } from "./auth";

export { NotAuthorizedError } from "./errors";

/**
 * Real session verification, replacing the Phase 3 placeholder (which read
 * an unsigned cookie with no verification at all). Every call site should
 * import from here, not call `auth.api.getSession` directly — that's what
 * keeps a future provider swap (unlikely, but see architecture §12's
 * abstraction discipline) contained to this file.
 *
 * IMPORTANT — this makes a real database call every time. That's
 * deliberate, not an oversight: CVE-2025-29927 showed that Next.js
 * middleware-only session checks can be bypassed by spoofing the
 * `x-middleware-subrequest` header. `middleware.ts` only ever does an
 * optimistic cookie-presence redirect for UX; this function, called inside
 * the actual protected page/layout, is the real security boundary.
 */
export interface SessionShape {
  userId: string;
  email: string | null;
  name: string | null;
}

export async function getSession(): Promise<SessionShape | null> {
  const result = await auth.api.getSession({ headers: headers() });
  if (!result?.session || !result.user) return null;

  return {
    userId: result.user.id,
    email: result.user.email ?? null,
    name: result.user.name ?? null,
  };
}

