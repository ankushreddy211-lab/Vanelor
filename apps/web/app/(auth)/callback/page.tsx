"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// Adjust this import path if your auth-client is located somewhere else relative to app/auth/callback/page.tsx
import { supabaseClient } from "../../../lib/auth/auth-client";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/dashboard");
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-[#f4f4f5]">
      <p className="text-xs tracking-widest uppercase text-[#a1a1aa] font-sans">
        Verifying your session...
      </p>
    </main>
  );
}       