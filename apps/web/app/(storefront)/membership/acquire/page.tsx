"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseClient } from "../../../../lib/auth/auth-client";

export default function MembershipAcquirePage() {
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const MAX_MEMBERS = 333;

  useEffect(() => {
    const fetchMemberCount = async () => {
      const { count, error } = await supabaseClient
        .from("user_registries")
        .select("*", { count: "exact", head: true })
        .eq("standing", "founding_circle");

      if (!error && count !== null) {
        setMemberCount(count);
      }
    };

    fetchMemberCount();
  }, []);

  // Calculate available spots
  const availableCount = memberCount !== null ? MAX_MEMBERS - memberCount : MAX_MEMBERS;

  const perks = [
    "48-hour early access to every collection",
    "Priority reservation window",
    "Free standard shipping",
    "Digital Founding Member card",
    "Permanent Founding Member number",
    "Members-only journal and lookbooks",
    "Access to limited capsule releases",
    "Annual Founding gift",
    "Private announcements and development updates"
  ];

  return (
    <div className="min-h-screen bg-bg text-fg px-4 sm:px-6 pt-24 md:pt-32 pb-24 lg:px-12 transition-colors duration-200 max-w-[100vw] overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">
        
        {/* HEADER */}
        <div className="border-b border-theme pb-6 sm:pb-8 space-y-3 text-center md:text-left">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-fg-subtle block">
            Atelier Governance & Acquisition
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight uppercase text-fg">
            House Standing
          </h1>
          <p className="text-xs font-mono uppercase tracking-wider text-fg-muted max-w-xl mx-auto md:mx-0">
            Secure your permanent place within the Valenor ledger and gain full access to private house privileges.
          </p>
        </div>

        {/* FOUNDING CIRCLE TIER CARD */}
        <div className="border border-fg bg-bg-raised/70 p-6 sm:p-8 md:p-12 shadow-xl relative rounded-none space-y-6 sm:space-y-8">
          
          <div className="absolute top-0 right-0 bg-fg text-bg font-mono text-[9px] uppercase tracking-widest px-3 py-1 sm:px-4 sm:py-1.5 font-bold">
            {availableCount} / {MAX_MEMBERS} Available
          </div>

          <div className="space-y-4 border-b border-theme/30 pb-6 sm:pb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-fg-subtle block">
              Lifetime Allocation
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-light uppercase tracking-wide text-fg">
              Founding Circle
            </h2>
            <div className="text-3xl sm:text-4xl font-light font-mono tracking-tight text-accent-strong">
              ₹3,333 <span className="text-xs font-sans text-fg-muted uppercase tracking-normal">/ Lifetime</span>
            </div>
            <p className="text-sm text-fg-muted leading-relaxed font-sans max-w-2xl pt-2">
              Become one of the first 333 patrons who help establish the House. Your membership number and status are permanent.
            </p>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-fg-subtle block">
              Benefits & Inclusions:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
              {perks.map((perk, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs font-mono text-fg-muted">
                  <span className="text-accent-strong mt-0.5">✦</span>
                  <span className="tracking-wide">{perk}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CHECKOUT ACTIONS BAR */}
        <div className="border border-theme bg-bg-raised/50 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 rounded-none">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-fg-subtle block">
              Allocation Protocol
            </span>
            <p className="text-xs sm:text-sm font-mono uppercase text-fg">
              Target Tier: <span className="text-accent-strong font-bold">Founding Circle (₹3,333)</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <Link 
              href="/"
              className="w-full sm:w-auto px-6 py-3 border border-theme bg-bg text-fg-muted hover:text-fg font-mono text-xs uppercase tracking-wider text-center transition-colors"
            >
              Return Home
            </Link>
            
            <Link
              href="/membership/checkout?tier=founding_circle&amount=3333"
              className="w-full sm:w-auto md:flex-none px-8 py-3 bg-fg text-bg hover:opacity-90 font-mono text-xs uppercase tracking-[0.2em] font-bold transition-all text-center"
            >
              Request for Membership →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}