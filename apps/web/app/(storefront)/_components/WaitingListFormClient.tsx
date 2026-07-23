"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseClient } from "@/lib/auth/auth-client";

interface ProductDetails {
  title: string;
  price: number;
  member_price?: number;
  currency?: string;
  category?: string;
  sizes?: string[];
}

interface Props {
  initialIsMember: boolean;
  initialEmail: string;
  initialName: string;
}

export default function WaitingListFormClient({ initialIsMember, initialEmail, initialName }: Props) {
  const searchParams = useSearchParams();
  const defaultProduct = searchParams.get("product") || "";

  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState("");
  const [selectedPiece, setSelectedPiece] = useState(defaultProduct);
  const [sizePreference, setSizePreference] = useState("Standard / Custom Tailored");
  const [availableSizes, setAvailableSizes] = useState<string[]>([
    "Standard / Custom Tailored",
    "Size I (Small / 38)",
    "Size II (Medium / 40)",
    "Size III (Large / 42)",
    "Size IV (XL / 44)"
  ]);
  const [notes, setNotes] = useState("");

  const [productData, setProductData] = useState<ProductDetails | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (defaultProduct) {
        setSelectedPiece(defaultProduct);
        const { data: prod } = await supabaseClient
          .from("products")
          .select("title, price, member_price, currency, category, sizes")
          .ilike("title", defaultProduct)
          .maybeSingle();

        if (prod) {
          setProductData(prod);
          // If the product has custom sizes assigned in the catalog, use them
          if (prod.sizes && prod.sizes.length > 0) {
            setAvailableSizes([...prod.sizes, "Standard / Custom Tailored"]);
            setSizePreference(prod.sizes[0] || "Standard / Custom Tailored");
          }
        }
      }
    }
    fetchProduct();
  }, [defaultProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const currencySymbol = productData?.currency === 'NPR' ? 'Rs. ' : '$';
    const applicablePrice = initialIsMember && productData?.member_price ? productData.member_price : productData?.price;
    const priceTierLabel = initialIsMember ? "House Member Price" : "Standard Retail Price";
    const formattedPriceRecord = applicablePrice ? `${currencySymbol}${applicablePrice.toLocaleString()} (${priceTierLabel})` : "Price on Request";

    try {
      // 1. Get authenticated user session securely
      const { data: { user } } = await supabaseClient.auth.getUser();

      // 2. Insert mapped precisely to your exact 'reservations' table schema
      const { error } = await supabaseClient.from("reservations").insert([
        {
          user_id: user?.id || null,
          customer_name: fullName,
          customer_email: email,
          status: "pending",
          // Pack extra telemetry, custom fields, category, and phone details into notes cleanly
          notes: `[Phone: ${phone}] | [Piece: ${selectedPiece || "General Archive Drop"}] | [Category: ${productData?.category || "General"}] | [Size: ${sizePreference}] | [Membership: ${initialIsMember ? "Verified Member" : "Guest"}] | [Price: ${formattedPriceRecord}] | ${notes}`,
        },
      ]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit acquisition request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md w-full bg-bg-raised border border-theme p-8 rounded text-center space-y-6 shadow-2xl mx-auto">
        <div className="w-12 h-12 bg-accent-strong/10 border border-accent-strong/30 text-accent-strong rounded-full flex items-center justify-center mx-auto text-lg font-mono">
          ✓
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight uppercase tracking-wider text-fg">Acquisition Queued</h1>
          <p className="text-xs text-fg-muted leading-relaxed font-sans">
            Your dossier for <span className="text-fg font-medium">{selectedPiece}</span> has been securely logged with your <span className="text-accent-strong">{initialIsMember ? "Verified Member" : "Guest"}</span> pricing tier. Our concierge will review your request shortly.
          </p>
        </div>
        <Link
          href="/collections"
          className="w-full bg-fg text-bg py-3 rounded text-xs font-mono uppercase tracking-[0.2em] font-medium block transition-opacity hover:opacity-95"
        >
          Return to Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href="/collections"
          className="font-mono text-xs text-fg-muted uppercase tracking-[0.25em] hover:text-accent-strong transition-colors inline-flex items-center gap-2"
        >
          <span>←</span> Return to Archive
        </Link>
      </div>

      <div className="border-b border-theme pb-6 space-y-2">
        <span className="font-mono text-[10px] text-accent-strong uppercase tracking-[0.3em]">
          Secure Reservation Protocol
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-fg">
          Waiting List & Acquisition Dossier
        </h1>
        <p className="text-xs text-fg-muted font-light leading-relaxed flex items-center gap-2">
          Submitting order line for: <strong className="text-fg">{selectedPiece || "General Archive Drop"}</strong>
          {productData?.category && (
            <span className="bg-bg-raised border border-theme px-2 py-0.5 rounded text-[10px] font-mono uppercase text-accent-strong">
              {productData.category}
            </span>
          )}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded font-mono">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-bg-raised border border-theme p-6 sm:p-8 rounded shadow-sm">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Selected Piece / Garment</label>
              <input
                type="text"
                required
                readOnly
                value={selectedPiece}
                className="w-full bg-bg/50 border border-theme rounded px-3 py-2.5 text-sm text-accent-strong font-medium focus:outline-none cursor-not-allowed"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Patron Credential Status</label>
              <div className={`w-full border rounded px-3 py-2.5 text-sm flex items-center justify-between font-mono ${
                initialIsMember ? 'bg-accent-strong/10 border-accent-strong/30 text-accent-strong' : 'bg-bg border-theme text-fg-muted'
              }`}>
                <span>{initialIsMember ? "Membership Activated ✓" : "Not a Member"}</span>
                {initialIsMember && <span className="text-[10px] uppercase tracking-wider opacity-75">Registry Verified</span>}
              </div>
            </div>
          </div>

          {productData && (
            <div className="p-4 bg-bg border border-theme rounded space-y-1.5 font-mono text-xs">
              <div className="text-fg-muted uppercase tracking-widest text-[10px]">Applicable Acquisition Rate</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-fg font-medium">
                  {initialIsMember && productData.member_price ? (
                    <span className="text-accent-strong">
                      {productData.currency === 'NPR' ? 'Rs. ' : '$'}{productData.member_price.toLocaleString()} (House Member Rate)
                    </span>
                  ) : (
                    <span>
                      {productData.currency === 'NPR' ? 'Rs. ' : '$'}{productData.price?.toLocaleString()} (Standard Retail Rate)
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">
              Tailoring & Size Specification {productData?.category ? `(${productData.category})` : ""}
            </label>
            <select
              value={sizePreference}
              onChange={(e) => setSizePreference(e.target.value)}
              className="w-full bg-bg border border-theme rounded p-[11px] text-sm text-fg focus:outline-none focus:border-fg cursor-pointer font-mono"
            >
              {availableSizes.map((sizeOption) => (
                <option key={sizeOption} value={sizeOption}>
                  {sizeOption}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Concierge Notes & Special Requests</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-bg border border-theme rounded p-3 text-sm text-fg focus:outline-none focus:border-fg resize-none leading-normal"
              placeholder="Specify custom sizing adjustments or delivery instructions..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-fg text-bg py-4 rounded text-xs font-mono font-bold uppercase tracking-[0.25em] transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer"
        >
          {submitting ? "Transmitting Dossier..." : "Submit Acquisition Dossier"}
        </button>
      </form>
    </div>
  );
}