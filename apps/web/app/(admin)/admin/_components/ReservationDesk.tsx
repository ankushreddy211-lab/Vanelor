"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "../../../../lib/auth/auth-client";

interface ReservationRecord {
  id: string;
  customer_email: string;
  customer_name: string;
  status: string;
  created_at: string;
  notes: string;
  products: { title: string } | null;
}

export function ReservationDesk() {
  const [items, setItems] = useState<ReservationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<ReservationRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadReservations() {
    setLoading(true);
    const { data } = await supabaseClient
      .from("reservations")
      .select("id, customer_email, customer_name, status, created_at, notes, products(title)")
      .order("created_at", { ascending: false });
    if (data) setItems(data as any);
    setLoading(false);
  }

  useEffect(() => {
    loadReservations();
  }, []);

  const updateStatus = async (id: string, newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionError(null);

    // 1. Instantly update UI state so it changes immediately without waiting for network latency
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (selectedRecord?.id === id) {
      setSelectedRecord((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // 2. Perform database update in the background
    const { error } = await supabaseClient
      .from("reservations")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Status update failed:", error.message);
      setActionError(error.message);
      // Rollback UI changes if the database rejects the update
      loadReservations();
    }
  };

  const parseNotes = (notesString: string) => {
    if (!notesString) return { phone: '', piece: '', size: '', membership: '', price: '', userNotes: '' };

    const getTag = (tag: string) => {
      const match = notesString.match(new RegExp(`\\[${tag}:\\s([^\\]]+)\\]`));
      return match ? match[1] : '';
    };

    const parts = notesString.split('|');
    const lastPart = parts[parts.length - 1]?.trim();
    const userNotes = lastPart && !lastPart.startsWith('[') ? lastPart : '';

    return {
      phone: getTag('Phone'),
      piece: getTag('Piece'),
      size: getTag('Size'),
      membership: getTag('Membership'),
      price: getTag('Price'),
      userNotes,
    };
  };

  const getGarmentTitle = (row: ReservationRecord) => {
    if (row.products?.title) return row.products.title;
    const parsed = parseNotes(row.notes);
    return parsed.piece || "General Archive Drop";
  };

  if (loading) {
    return <div className="font-mono text-xs text-fg-muted tracking-widest py-12 text-center">SYNCHRONIZING SECURE LEDGERS...</div>;
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden font-sans text-fg relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-theme pb-4 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent-strong block">
            Allocation Gateway
          </span>
          <h3 className="text-lg sm:text-xl font-light uppercase tracking-wider text-fg">
            Reservation Center ({items.length})
          </h3>
        </div>
        <button 
          onClick={loadReservations} 
          className="font-mono text-xs text-fg-muted hover:text-fg uppercase tracking-wider bg-bg border border-theme px-4 py-2 rounded-none transition-colors cursor-pointer w-full sm:w-auto text-center"
        >
          Refresh Ledger
        </button>
      </div>

      {actionError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono rounded-none">
          Action Error: {actionError}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block border border-theme bg-bg rounded-none overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme bg-bg-raised font-mono text-[10px] text-fg-muted uppercase tracking-[0.2em]">
                <th className="p-4 font-normal">Customer Name</th>
                <th className="p-4 font-normal">Member Status</th>
                <th className="p-4 font-normal">Requested Date & Time</th>
                <th className="p-4 font-normal">State</th>
                <th className="p-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme font-mono text-xs">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-fg-muted tracking-widest uppercase">
                    No active house allocations detected in active drop layer
                  </td>
                </tr>
              ) : (
                items.map((row) => {
                  const details = parseNotes(row.notes);
                  const isMember = details.membership.toLowerCase().includes("verified");

                  return (
                    <tr 
                      key={row.id} 
                      onClick={() => setSelectedRecord(row)}
                      className="hover:bg-bg-raised/50 transition-colors cursor-pointer group font-sans"
                    >
                      <td className="p-4">
                        <div className="text-fg uppercase font-bold group-hover:text-fg-muted transition-colors">{row.customer_name || "Anonymous Patron"}</div>
                        <div className="text-[10px] text-fg-muted mt-0.5 font-mono">{row.customer_email}</div>
                      </td>

                      <td className="p-4 font-mono">
                        <span className={`px-2 py-1 text-[10px] uppercase border rounded-none ${
                          isMember 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-bg-raised border-theme text-fg-muted'
                        }`}>
                          {isMember ? "Verified Member ✓" : "Guest Patron"}
                        </span>
                      </td>

                      <td className="p-4 text-fg-muted text-[11px] whitespace-nowrap font-mono">
                        {new Date(row.created_at).toLocaleString()}
                      </td>

                      <td className="p-4 font-mono">
                        <span className={`px-2 py-0.5 text-[10px] uppercase border rounded-none ${
                          row.status === "confirmed" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                          row.status === "pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                          "bg-bg-raised border-theme text-fg-muted"
                        }`}>
                          {row.status}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {row.status === "pending" && (
                          <>
                            <button onClick={(e) => updateStatus(row.id, "confirmed", e)} className="bg-fg text-bg px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider hover:opacity-90 font-mono cursor-pointer">
                              Confirm
                            </button>
                            <button onClick={(e) => updateStatus(row.id, "cancelled", e)} className="text-fg-muted hover:text-red-400 px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono cursor-pointer">
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Stack View */}
      <div className="md:hidden space-y-4">
        {items.length === 0 ? (
          <div className="py-16 text-center border border-theme bg-bg-raised/30">
            <p className="font-mono text-xs text-fg-muted uppercase tracking-wider">No active allocations detected</p>
          </div>
        ) : (
          items.map((row) => {
            const details = parseNotes(row.notes);
            const isMember = details.membership.toLowerCase().includes("verified");

            return (
              <div 
                key={row.id} 
                onClick={() => setSelectedRecord(row)}
                className="border border-theme bg-bg-raised/40 p-4 space-y-4 font-sans cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm text-fg uppercase">{row.customer_name || "Anonymous Patron"}</h4>
                    <p className="font-mono text-[10px] text-fg-muted">{row.customer_email}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] uppercase border font-mono ${
                    row.status === "confirmed" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                    row.status === "pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                    "bg-bg-raised border-theme text-fg-muted"
                  }`}>
                    {row.status}
                  </span>
                </div>

                <div className="flex justify-between items-center font-mono text-xs pt-2 border-t border-theme/35">
                  <span className={`px-2 py-0.5 text-[9px] uppercase border ${
                    isMember ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-bg-raised border-theme text-fg-muted'
                  }`}>
                    {isMember ? "Verified Member ✓" : "Guest Patron"}
                  </span>
                  <span className="text-[10px] text-fg-muted">{new Date(row.created_at).toLocaleDateString()}</span>
                </div>

                {row.status === "pending" && (
                  <div className="pt-2 border-t border-theme/35 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={(e) => updateStatus(row.id, "confirmed", e)} className="flex-1 bg-fg text-bg py-2 text-[10px] uppercase font-bold tracking-wider font-mono cursor-pointer">
                      Confirm
                    </button>
                    <button onClick={(e) => updateStatus(row.id, "cancelled", e)} className="flex-1 border border-theme text-red-400 py-2 text-[10px] uppercase font-mono cursor-pointer">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedRecord && (() => {
        const details = parseNotes(selectedRecord.notes);
        const isMember = details.membership.toLowerCase().includes("verified");

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200" onClick={() => setSelectedRecord(null)}>
            <div className="w-full max-w-lg bg-bg-raised border-l border-theme p-6 sm:p-8 h-full overflow-y-auto space-y-8 text-fg font-mono shadow-2xl" onClick={(e) => e.stopPropagation()}>
              
              <div className="flex items-center justify-between border-b border-theme pb-4">
                <div>
                  <span className="text-[10px] text-fg-subtle uppercase tracking-widest">Acquisition Dossier</span>
                  <h2 className="text-lg font-bold uppercase text-fg mt-1 font-sans">{selectedRecord.customer_name}</h2>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="text-fg-muted hover:text-fg text-lg px-2 cursor-pointer">
                  ✕
                </button>
              </div>

              <div className="space-y-6 text-xs">
                <div className="bg-bg border border-theme p-4 rounded-none space-y-3">
                  <div className="text-[10px] text-fg-subtle uppercase tracking-widest font-bold">Patron Credentials</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                    <div>
                      <span className="text-fg-subtle block text-[10px] font-mono">Email</span>
                      <span className="text-fg font-mono">{selectedRecord.customer_email}</span>
                    </div>
                    <div>
                      <span className="text-fg-subtle block text-[10px] font-mono">Phone / WhatsApp</span>
                      <span className="text-fg font-mono">{details.phone || "Not Provided"}</span>
                    </div>
                    <div>
                      <span className="text-fg-subtle block text-[10px] font-mono">Credential Tier</span>
                      <span className={isMember ? "text-emerald-400 font-bold font-mono" : "text-fg-muted font-mono"}>
                        {isMember ? "Verified House Member" : "Guest / Standard"}
                      </span>
                    </div>
                    <div>
                      <span className="text-fg-subtle block text-[10px] font-mono">Request Status</span>
                      <span className="text-amber-400 uppercase font-bold font-mono">{selectedRecord.status}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-bg border border-theme p-4 rounded-none space-y-3">
                  <div className="text-[10px] text-fg-subtle uppercase tracking-widest font-bold">Allocation Details</div>
                  <div className="space-y-2 font-sans">
                    <div>
                      <span className="text-fg-subtle block text-[10px] font-mono">Allocated Garment</span>
                      <span className="text-fg font-bold uppercase">{getGarmentTitle(selectedRecord)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-fg-subtle block text-[10px] font-mono">Size Preference</span>
                        <span className="text-fg">{details.size || "Standard"}</span>
                      </div>
                      <div>
                        <span className="text-fg-subtle block text-[10px] font-mono">Applicable Rate</span>
                        <span className="text-emerald-400 font-bold font-mono">{details.price || "Standard Rate"}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-fg-subtle block text-[10px] font-mono pt-2">Logged Timestamp</span>
                      <span className="text-fg-muted font-mono">{new Date(selectedRecord.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {details.userNotes && (
                  <div className="bg-bg border border-theme p-4 rounded-none space-y-2">
                    <div className="text-[10px] text-fg-subtle uppercase tracking-widest font-bold">Concierge Notes & Special Requests</div>
                    <p className="text-fg font-sans text-sm leading-relaxed italic bg-bg-raised p-3 border border-theme/50">
                      &quot;{details.userNotes}&quot;
                    </p>
                  </div>
                )}
              </div>

              {selectedRecord.status === "pending" && (
                <div className="border-t border-theme pt-6 flex gap-3">
                  <button 
                    onClick={(e) => updateStatus(selectedRecord.id, "confirmed", e)}
                    className="flex-1 bg-fg text-bg py-3 text-xs uppercase font-bold tracking-widest hover:opacity-90 font-mono cursor-pointer"
                  >
                    Confirm Order
                  </button>
                  <button 
                    onClick={(e) => updateStatus(selectedRecord.id, "cancelled", e)}
                    className="px-6 border border-theme text-fg-muted hover:text-red-400 hover:border-red-500/50 text-xs uppercase tracking-widest font-mono cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              )}

            </div>
          </div>
        );
      })()}
    </div>
  );
}