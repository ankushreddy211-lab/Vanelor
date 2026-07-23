"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function verifyAndRecordMembershipPayment(userId: string, tier: string, paymentId: string) {
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
          } catch {
            // The method was called from a Server Component.
          }
        },
      },
    }
  );

  const { error } = await supabase
    .from("user_registries")
    .update({
      standing: tier,
      security_status: "Verified",
      payment_id: paymentId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Failed to update Supabase registry:", error.message);
    throw new Error("Ledger synchronization failed.");
  }

  return { success: true };
}