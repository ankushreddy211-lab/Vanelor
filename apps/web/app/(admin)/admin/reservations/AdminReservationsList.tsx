"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/auth/auth-client";

interface Reservation {
  id: string;
  customer_name: string;
  customer_email: string;
  status: "pending" | "approved" | "rejected" | string;
  notes: string;
  created_at: string;
}

export default function AdminReservationsList() {
  const [requests, setRequests] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNotesMap, setAdminNotesMap] = useState<{ [key: string]: string }>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; text: string; type: 'success' | 'error' } | null>(null);

  // Fetch all membership requests from Supabase
  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const membershipReqs = data.filter((item: Reservation) =>
        item.notes?.includes("[Membership Request]")
      );
      setRequests(membershipReqs);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    // Enable Realtime Subscription so admin updates stream live
    const channel = supabaseClient
      .channel("admin-reservations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  // Update status and optional admin note in Supabase when Admin clicks Accept or Reject
  const handleStatusUpdate = async (req: Reservation, newStatus: "approved" | "rejected") => {
    setUpdatingId(req.id);
    setFeedbackMsg(null);

    const customNote = adminNotesMap[req.id] || "";
    // Append or format admin feedback note into notes
    const updatedNotes = customNote.trim() 
      ? `${req.notes} | [Admin Feedback: ${customNote}]` 
      : req.notes;

    const { error } = await supabaseClient
      .from("reservations")
      .update({ 
        status: newStatus,
        notes: updatedNotes
      })
      .eq("id", req.id);

    if (!error) {
      setRequests((prev) =>
        prev.map((item) => (item.id === req.id ? { ...item, status: newStatus, notes: updatedNotes } : item))
      );
      setFeedbackMsg({
        id: req.id,
        text: newStatus === "approved" ? "Dossier accepted with notice." : "Nomination declined with notice.",
        type: "success",
      });
    } else {
      setFeedbackMsg({
        id: req.id,
        text: "Persistence error: " + error.message,
        type: "error",
      });
    }

    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs uppercase tracking-widest text-fg-muted">
        Fetching Membership Dossiers...
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between border-b border-theme pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent-strong block">
            House Ledger Governance
          </span>
          <h2 className="text-xl font-light uppercase tracking-wider text-fg">
            Membership Requests ({requests.length})
          </h2>
        </div>
        <button
          onClick={fetchRequests}
          className="font-mono text-xs uppercase tracking-wider border border-theme px-3 py-1.5 hover:bg-bg-raised transition-colors cursor-pointer"
        >
          Refresh Ledger
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="py-16 text-center border border-theme/40 bg-bg-raised/20">
          <p className="font-mono text-xs uppercase tracking-widest text-fg-muted">
            No pending membership requests found in ledger.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isApproved = req.status === "approved";
            const isRejected = req.status === "rejected" || req.status === "cancelled" || req.status === "declined";
            const currentFeedback = feedbackMsg?.id === req.id ? feedbackMsg : null;

            return (
              <div
                key={req.id}
                className="border border-theme bg-bg-raised/40 p-6 flex flex-col gap-6"
              >
                {/* Applicant Info */}
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-lg tracking-wide text-fg">
                        {req.customer_name || "Anonymous Patron"}
                      </h3>
                      <span
                        className={`font-mono text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded border ${
                          isApproved
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : isRejected
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-fg-subtle">
                      Submitted: {new Date(req.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-fg-muted">
                    {req.customer_email}
                  </p>

                  <div className="text-xs font-sans text-fg-muted bg-bg p-3 border border-theme/30 rounded-none leading-relaxed mt-2">
                    {req.notes}
                  </div>

                  {currentFeedback && (
                    <div className={`text-[11px] font-mono p-2 border ${
                      currentFeedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                      {currentFeedback.text}
                    </div>
                  )}
                </div>

                {/* Admin Optional Note Input & Action Controls */}
                <div className="space-y-3 pt-4 border-t border-theme/30">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-fg-subtle">
                      Optional Committee Feedback Note (Sent to Patron)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Please provide updated verification or Welcome to the Circle..."
                      value={adminNotesMap[req.id] || ""}
                      onChange={(e) =>
                        setAdminNotesMap({ ...adminNotesMap, [req.id]: e.target.value })
                      }
                      className="w-full bg-bg border border-theme rounded px-3 py-2 text-xs text-fg focus:outline-none focus:border-fg font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 w-full">
                    <button
                      onClick={() => handleStatusUpdate(req, "approved")}
                      disabled={updatingId === req.id}
                      className={`px-6 py-2.5 font-mono text-xs uppercase tracking-wider transition-all border cursor-pointer ${
                        isApproved
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-black"
                      }`}
                    >
                      {updatingId === req.id ? "Processing..." : "Accept Dossier ✓"}
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(req, "rejected")}
                      disabled={updatingId === req.id}
                      className={`px-6 py-2.5 font-mono text-xs uppercase tracking-wider transition-all border cursor-pointer ${
                        isRejected
                          ? "bg-red-500/20 border-red-500 text-red-300"
                          : "bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white"
                      }`}
                    >
                      {updatingId === req.id ? "Processing..." : "Decline Nomination ✕"}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}