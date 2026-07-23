import { createAuthClient } from "better-auth/react";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Global Better Auth Client instance for frontend authentication.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, useSession, signOut } = authClient;

/**
 * Global Supabase Browser Client instance for client-side authentication.
 */
export const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);