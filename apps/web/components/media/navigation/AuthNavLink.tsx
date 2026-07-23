"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "../../../lib/auth/auth-client";

export function AuthNavLink() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const getInitialUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user);
      
      if (user) {
        // 1. Check membership status using maybeSingle() to prevent 406 errors
        const { data: registry } = await supabaseClient
          .from("user_registries")
          .select("standing, security_status, role")
          .eq("id", user.id)
          .maybeSingle();

        if (registry?.security_status === "Verified" || registry?.standing === "founding_circle") {
          setIsMember(true);
        }

        // 2. Check admin status
        if (user.user_metadata?.role === "admin" || registry?.role === "admin") {
          setIsAdminUser(true);
        }
      }
      
      setLoading(false);
    };
    
    getInitialUser();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: registry } = await supabaseClient
            .from("user_registries")
            .select("standing, security_status, role")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (registry?.security_status === "Verified" || registry?.standing === "founding_circle") {
            setIsMember(true);
          } else {
            setIsMember(false);
          }

          if (currentUser.user_metadata?.role === "admin" || registry?.role === "admin") {
            setIsAdminUser(true);
          } else {
            setIsAdminUser(false);
          }
        } else {
          setIsMember(false);
          setIsAdminUser(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <span className="opacity-0">Sign In</span>;

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.refresh();
  };

  if (user) {
    const userName = user.user_metadata?.name || user.email?.split("@")[0] || "User";
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border border-border bg-fg/5 px-4 py-2">
          <span className="label text-fg uppercase tracking-wider">
            {userName}
          </span>
          
          {/* Admin Tag */}
          {isAdminUser && (
            <span className="px-2 py-0.5 bg-fg text-bg font-mono text-[9px] uppercase tracking-widest font-bold">
              Admin
            </span>
          )}

          {/* Member Tag */}
          {isMember && (
            <span className="px-2 py-0.5 bg-accent-strong text-bg font-mono text-[9px] uppercase tracking-widest font-bold">
              Member
            </span>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs text-fg-subtle hover:text-accent-strong uppercase tracking-wider underline underline-offset-4 cursor-pointer"
        >
          Exit
        </button>
      </div>
    );
  }

  return (
    <a
      href="/sign-in"
      className="label border border-border px-4 py-2 transition-colors hover:border-accent-strong hover:text-accent-strong uppercase tracking-wider"
    >
      Sign In
    </a>
  );
}