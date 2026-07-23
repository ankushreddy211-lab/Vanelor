"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "@/lib/auth/auth-client";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tier = searchParams.get("tier") || "founding_circle";
  const amount = searchParams.get("amount") || "3333";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [statement, setStatement] = useState("");

  const [existingRequest, setExistingRequest] = useState<any | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch latest existing membership request reliably
  async function fetchExistingRequest(userEmail?: string, userId?: string) {
    try {
      let query = supabaseClient
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false });

      if (userEmail && userId) {
        query = query.or(`customer_email.eq."${userEmail}",user_id.eq."${userId}"`);
      } else if (userEmail) {
        query = query.eq("customer_email", userEmail);
      } else if (userId) {
        query = query.eq("user_id", userId);
      } else {
        setCheckingStatus(false);
        return;
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        // Find the latest record containing '[Membership Request]'
        const membershipReq = data.find((item: any) =>
          item.notes && item.notes.includes("[Membership Request]")
        );
        setExistingRequest(membershipReq || null);
      } else {
        setExistingRequest(null);
      }
    } catch (err) {
      console.error("Error checking existing request:", err);
    } finally {
      setCheckingStatus(false);
    }
  }

  // Initial user check & Realtime updates setup
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        if (user.email) setEmail(user.email);
        if (user.user_metadata?.full_name || user.user_metadata?.name) {
          setFullName(user.user_metadata.full_name || user.user_metadata.name);
        }
        await fetchExistingRequest(user.email, user.id);
      } else {
        setCheckingStatus(false);
      }
    }

    init();

    // Live sync for real-time updates when Admin accepts/rejects/deletes requests
    const channel = supabaseClient
      .channel("membership-request-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        async () => {
          const { data: { user } } = await supabaseClient.auth.getUser();
          if (user) {
            await fetchExistingRequest(user.email, user.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const { data: { user } } = await supabaseClient.auth.getUser();

      const payload = {
        user_id: user?.id || null,
        customer_name: fullName,
        customer_email: email,
        status: "pending",
        notes: `[Membership Request] | [Tier: Founding Circle (${tier})] | [Fee: ₹${amount}] | [Phone: ${phone}] | [Statement: ${statement || "None"}]`
      };

      const { error } = await supabaseClient.from("reservations").insert([payload]);

      if (error) throw error;

      await fetchExistingRequest(email, user?.id);
      setSubmitting(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit membership dossier.");
      setSubmitting(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="max-w-3xl mx-auto py-32 text-center font-mono text-xs uppercase tracking-widest text-fg-subtle">
        Verifying Ledger Standing...
      </div>
    );
  }

  // If request exists in DB, render live status panel with optional admin message support
  if (existingRequest) {
    const isApproved = 
      existingRequest.status === "approved" || 
      existingRequest.status === "completed" || 
      existingRequest.status === "confirmed";

    const isRejected = 
      existingRequest.status === "rejected" || 
      existingRequest.status === "declined" || 
      existingRequest.status === "cancelled";

    return (
      <div className="max-w-xl mx-auto bg-bg-raised border border-theme p-8 md:p-12 text-center space-y-6 shadow-2xl rounded-none">
        <div className={`w-14 h-14 border rounded-full flex items-center justify-center mx-auto text-xl font-mono ${
          isApproved ? 'bg-accent-strong/10 border-accent-strong/30 text-accent-strong' :
          isRejected ? 'bg-red-500/10 border-red-500/30 text-red-500' :
          'bg-accent-strong/10 border-accent-strong/30 text-accent-strong'
        }`}>
          {isApproved ? '✓' : isRejected ? '✕' : '✦'}
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent-strong block">
            {isApproved ? 'Standing Verified' : isRejected ? 'Nomination Declined' : 'Dossier Under Review'}
          </span>
          <h1 className="text-2xl font-light tracking-tight uppercase text-fg">
            {isApproved ? 'Membership Granted' : isRejected ? 'Request Unsuccessful' : 'Request Already Lodged'}
          </h1>
          <p className="text-xs text-fg-muted leading-relaxed font-sans max-w-md mx-auto">
            {isApproved 
              ? 'Your membership dossier has been accepted by the House committee. Your credentials are now active in the ledger.'
              : isRejected 
              ? 'Unfortunately, your nomination for House Standing was declined by the committee at this time.'
              : 'Your request for House Standing is currently under review by our team. We will notify you once your nomination is processed into the ledger.'
            }
          </p>

          {/* Optional Admin Feedback Note display if stored in database response */}
          {existingRequest.admin_notes && (
            <div className="mt-4 p-4 bg-bg border border-theme/40 text-left font-mono text-xs text-fg-muted space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-accent-strong block font-bold">Committee Evaluation Note:</span>
              <p className="font-sans leading-relaxed">{existingRequest.admin_notes}</p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-theme/30 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={isApproved ? "/membership/dashboard" : "/"}
            className="px-6 py-3 bg-fg text-bg font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity text-center"
          >
            {isApproved ? "Enter Member Portal" : "Return to Archive"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 w-full">
      <div className="border-b border-theme pb-6 space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-fg-subtle block">
          Atelier Governance & Nomination Protocol
        </span>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight uppercase text-fg">
          Request Membership Dossier
        </h1>
        <p className="text-xs font-mono uppercase tracking-wider text-fg-muted">
          Submit your credentials for review by the House committee. Approved applications are logged into the permanent ledger.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded font-mono">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmitRequest} className="space-y-6">
        <div className="border border-theme bg-bg-raised/40 p-6 sm:p-8 space-y-4 rounded-none">
          <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-fg-subtle border-b border-theme/30 pb-3">
            Selected Standing
          </h2>
          
          <div className="flex justify-between items-center font-mono text-xs sm:text-sm">
            <span className="uppercase text-fg">Founding Circle Lifetime Allocation</span>
            <span className="font-bold text-accent-strong">₹{amount}</span>
          </div>

          <div className="flex justify-between items-center font-mono text-sm sm:text-base font-bold text-fg pt-3 border-t border-theme/30">
            <span className="uppercase">Required Contribution</span>
            <span className="text-accent-strong">₹{amount}</span>
          </div>
        </div>

        <div className="border border-theme bg-bg-raised/40 p-6 sm:p-8 space-y-6 rounded-none">
          <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-fg-subtle border-b border-theme/30 pb-3">
            Patron Credentials
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-bg border border-theme rounded px-3 py-2.5 text-sm text-fg focus:outline-none focus:border-fg"
                placeholder="e.g. Alistair Sterling"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Electronic Mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg border border-theme rounded px-3 py-2.5 text-sm text-fg focus:outline-none focus:border-fg"
                  placeholder="name@domain.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Secure Phone / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-bg border border-theme rounded px-3 py-2.5 text-sm text-fg focus:outline-none focus:border-fg"
                  placeholder="+91 98000 00000"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Statement of Intent / Background (Optional)</label>
              <textarea
                rows={4}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className="w-full bg-bg border border-theme rounded p-3 text-sm text-fg focus:outline-none focus:border-fg resize-none leading-normal"
                placeholder="Briefly state your interest in joining the Valenor archive ledger..."
              />
            </div>
          </div>
        </div>

        <div className="border border-theme bg-bg-raised/50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-none">
          <Link 
            href="/membership/acquire"
            className="w-full sm:w-auto text-center text-xs font-mono uppercase text-fg-muted hover:text-fg tracking-wider px-4 py-2"
          >
            ← Back to Standing Tier
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-fg text-bg hover:opacity-90 font-mono text-xs uppercase tracking-[0.2em] font-bold transition-all disabled:opacity-50 text-center cursor-pointer"
          >
            {submitting ? "Transmitting Dossier..." : "Submit Membership Request →"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function MembershipCheckoutPage() {
  return (
    <div className="min-h-screen bg-bg text-fg px-4 sm:px-6 pt-24 md:pt-32 pb-24 lg:px-12 transition-colors duration-200 max-w-[100vw] overflow-x-hidden">
      <Suspense fallback={
        <div className="max-w-3xl mx-auto py-32 text-center font-mono text-xs uppercase tracking-widest text-fg-subtle">
          Initializing Protocol...
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}