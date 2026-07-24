"use client";

import { useState, useEffect, useTransition } from "react";
import { supabaseClient } from "../../../../lib/auth/auth-client";
import { adjustRegistryTier } from "../../../actions/registry";

interface RegistryRecord {
  id: string;
  customer_name: string;
  customer_email: string;
  membership_tier: string;
  lifetime_spend: number;
  total_reservations: number;
  total_orders: number;
  joined_at: string;
}

export function RegistryLedger() {
  const [patrons, setPatrons] = useState<RegistryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  async function loadRegistry() {
    setLoading(true);
    const { data } = await supabaseClient
      .from("house_registry")
      .select("id, customer_name, customer_email, membership_tier, lifetime_spend, total_reservations, total_orders, joined_at")
      .order("lifetime_spend", { ascending: false });
    if (data) setPatrons(data as any);
    setLoading(false);
  }

  useEffect(() => {
    loadRegistry();
  }, []);

  const adjustTier = (id: string, nextTier: string) => {
    // Optimistic UI update
    setPatrons(prev => prev.map(p => p.id === id ? { ...p, membership_tier: nextTier } : p));
    
    startTransition(async () => {
      try {
        await adjustRegistryTier(id, nextTier);
      } catch (error) {
        console.error("Failed to adjust tier", error);
        loadRegistry(); // Revert on failure
      }
    });
  };

  if (loading) {
    return <div className="font-mono text-xs text-fg-muted tracking-widest py-12 text-center">SYNCHRONIZING AUDIENCE ARCHIVE...</div>;
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden font-sans text-fg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-theme pb-4 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent-strong block">
            Audience Archive
          </span>
          <h3 className="text-lg sm:text-xl font-light uppercase tracking-wider text-fg">
            House Registry Ledger ({patrons.length})
          </h3>
        </div>
        <button 
          onClick={loadRegistry} 
          className="font-mono text-xs text-fg-muted hover:text-fg uppercase tracking-wider bg-bg border border-theme px-4 py-2 rounded-none transition-colors cursor-pointer w-full sm:w-auto text-center"
        >
          Refresh Ledger
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border border-theme bg-bg rounded-none overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme bg-bg-raised font-mono text-[10px] text-fg-muted uppercase tracking-[0.2em]">
                <th className="p-4 font-normal">Patron Identity / Joined</th>
                <th className="p-4 font-normal">Membership Tier</th>
                <th className="p-4 font-normal">Allocation Activity</th>
                <th className="p-4 font-normal">Lifetime Value</th>
                <th className="p-4 font-normal text-right">Tier Allocations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme font-mono text-xs">
              {patrons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-fg-muted tracking-widest uppercase">
                    No members listed in the active house registry
                  </td>
                </tr>
              ) : (
                patrons.map((patron) => (
                  <tr key={patron.id} className="hover:bg-bg-raised/50 transition-colors font-sans">
                    <td className="p-4 font-sans">
                      <div className="text-fg uppercase font-medium">{patron.customer_name || "House Guest"}</div>
                      <div className="text-[10px] text-fg-muted mt-0.5 font-mono">{patron.customer_email}</div>
                      <div className="text-[9px] text-fg-subtle mt-1 font-mono">SINCE: {new Date(patron.joined_at).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 font-mono">
                      <span className={`px-2 py-0.5 text-[9px] font-mono uppercase border tracking-widest font-semibold rounded-none ${
                        patron.membership_tier === "house_circle" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                        patron.membership_tier === "collector" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                        patron.membership_tier === "patron" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                        "bg-bg-raised border-theme text-fg-muted"
                      }`}>
                        {patron.membership_tier.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-fg-muted font-mono">
                      <div>Holds: {patron.total_reservations} Units</div>
                      <div className="text-[10px] text-fg-subtle">Settled: {patron.total_orders} Orders</div>
                    </td>
                    <td className="p-4 font-mono text-fg font-semibold">
                      INR {Number(patron.lifetime_spend).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <select
                        disabled={isPending}
                        value={patron.membership_tier}
                        onChange={(e) => adjustTier(patron.id, e.target.value)}
                        className="bg-bg border border-theme text-[10px] font-mono p-1.5 text-fg focus:outline-none focus:border-fg cursor-pointer uppercase tracking-wider rounded-none disabled:opacity-50"
                      >
                        <option value="guest">Guest</option>
                        <option value="registry">Registry</option>
                        <option value="patron">Patron</option>
                        <option value="collector">Collector</option>
                        <option value="house_circle">House Circle</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Stack View */}
      <div className="md:hidden space-y-4">
        {patrons.length === 0 ? (
          <div className="py-16 text-center border border-theme bg-bg-raised/30">
            <p className="font-mono text-xs text-fg-muted uppercase tracking-wider">No members listed in registry</p>
          </div>
        ) : (
          patrons.map((patron) => (
            <div key={patron.id} className="border border-theme bg-bg-raised/40 p-4 space-y-4 font-sans">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-sm text-fg uppercase">{patron.customer_name || "House Guest"}</h4>
                  <p className="font-mono text-[10px] text-fg-muted">{patron.customer_email}</p>
                </div>
                <span className={`px-2 py-0.5 text-[9px] uppercase border font-mono ${
                  patron.membership_tier === "house_circle" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                  patron.membership_tier === "collector" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                  "bg-blue-500/10 border-blue-500/20 text-blue-400"
                }`}>
                  {patron.membership_tier.replace("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs border-t border-theme/35">
                <div>
                  <span className="text-[10px] text-fg-subtle uppercase block">Lifetime Value</span>
                  <span className="text-fg font-bold">INR {Number(patron.lifetime_spend).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-fg-subtle uppercase block">Activity</span>
                  <span className="text-fg-muted">{patron.total_orders} Orders / {patron.total_reservations} Holds</span>
                </div>
              </div>

              <div className="pt-2 border-t border-theme/35 flex items-center justify-between gap-3">
                <span className="text-[10px] font-mono text-fg-muted uppercase">Modify Tier:</span>
                <select
                  disabled={isPending}
                  value={patron.membership_tier}
                  onChange={(e) => adjustTier(patron.id, e.target.value)}
                  className="bg-bg border border-theme text-[10px] font-mono p-1.5 text-fg focus:outline-none focus:border-fg cursor-pointer uppercase tracking-wider rounded-none flex-1 disabled:opacity-50"
                >
                  <option value="guest">Guest</option>
                  <option value="registry">Registry</option>
                  <option value="patron">Patron</option>
                  <option value="collector">Collector</option>
                  <option value="house_circle">House Circle</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}