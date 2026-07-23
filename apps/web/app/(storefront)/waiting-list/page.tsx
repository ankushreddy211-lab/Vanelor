import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import WaitingListFormClient from "../_components/WaitingListFormClient";
import { Suspense } from "react";

export default async function WaitingListPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  // 1. Get authenticated user session securely
  const { data: { user } } = await supabase.auth.getUser();

  let isMember = false;
  let userEmail = "";
  let userName = "";

  if (user) {
    userEmail = user.email || "";
    userName = user.user_metadata?.full_name || "";

    // 2. Query 'user_registries' using the auth user's 'id' column
    const { data: registryRecord } = await supabase
      .from("user_registries")
      .select("id, standing, role, security_status")
      .eq("id", user.id)
      .maybeSingle();

    if (registryRecord) {
      isMember = true;
    }
  }

  return (
    <main className="min-h-screen bg-bg text-fg font-sans antialiased pt-20 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-16">
      <Suspense fallback={<div className="text-center font-mono text-xs text-fg-muted py-20">Loading reservation portal...</div>}>
        <WaitingListFormClient 
          initialIsMember={isMember} 
          initialEmail={userEmail} 
          initialName={userName} 
        />
      </Suspense>
    </main>
  );
}