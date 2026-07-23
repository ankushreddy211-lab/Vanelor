import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NotAuthorizedError } from "./errors";
import { can, type RoleName } from "./permissions";

export { can, type RoleName } from "./permissions";

/**
 * Fetches the caller's roles via Supabase and delegates to the pure `can()` in
 * permissions.ts — architecture §10: "the same rule applies whether the
 * call comes from admin UI or a future API consumer."
 */
export async function assertCanForUser(userId: string, action: string): Promise<RoleName[]> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  // Fetch roles from your PostgreSQL tables via Supabase
  // Assuming a standard join or direct query on user roles
  const { data: userRoles, error } = await supabase
    .from("UserRole")
    .select("role:Role(name)")
    .eq("userId", userId);

  if (error || !userRoles) {
    throw new NotAuthorizedError(action);
  }

  const roles = userRoles.map((ur: any) => (ur.role?.name || ur.role) as RoleName);

  if (!can(roles, action)) {
    throw new NotAuthorizedError(action);
  }
  return roles;
}