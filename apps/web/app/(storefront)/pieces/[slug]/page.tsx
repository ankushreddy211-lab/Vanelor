"use client";

import { useParams } from "next/navigation";
import { Text } from "@valenor/design-system";
import { ReservationWizard } from "../../chapters/_components/ReservationWizard";

interface Spec {
  label: string;
  value: string;
}

interface Piece {
  numeralId: string;
  name: string;
  material: string;
  color: string;
  price: number;
  chapter: string;
  description: string;
  imageUrl: string;
  specifications: Spec[];
}

export default function PieceDetailPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  // Zero hardcoded catalog entries. This space expects a direct database record return.
  const piece: Piece | null = null; 

  if (!piece) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center font-mono text-xs tracking-widest uppercase">
        Specimen Identification Matrix Empty // Awaiting Database Feed
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg px-6 pt-32 pb-24 lg:px-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        <div className="lg:col-span-6 space-y-6">
          <div className="relative aspect-[3/4] w-full bg-bg-raised overflow-hidden border border-theme/40">
            <div className="absolute inset-0 flex items-center justify-center text-mono text-[10px] text-fg-subtle uppercase tracking-widest">
              {piece.name} — Technical Asset View
            </div>
          </div>
          
          <div className="border border-theme bg-bg-raised/10 p-6 space-y-4">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-fg border-b border-theme/40 pb-2">
              Garment Specification Ledger
            </h4>
            <div className="space-y-2.5 font-mono text-xs">
              {piece.specifications.map((spec) => (
                <div key={spec.label} className="flex justify-between items-start py-1 border-b border-theme/10 last:border-0">
                  <span className="text-fg-muted">{spec.label}</span>
                  <span className="text-fg text-right max-w-[60%]">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-8 lg:pl-6">
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent-strong font-bold">{piece.chapter}</span>
              <span className="text-xs font-mono text-fg-muted">Ref. 00{piece.numeralId}</span>
            </div>
            <h1 className="text-3xl font-light uppercase tracking-wide text-fg">{piece.name}</h1>
            <p className="text-sm font-mono text-fg-subtle">{piece.material} — {piece.color}</p>
            <p className="text-lg font-mono text-fg pt-2">₹{piece.price.toLocaleString('en-IN')}</p>
          </div>

          <p className="text-sm font-body leading-relaxed text-fg-muted border-t border-b border-theme/30 py-6">
            {piece.description}
          </p>

          <div className="pt-2">
            <ReservationWizard piece={{
              id: slug,
              title: piece.name,
              chapter: piece.chapter,
              price: piece.price,
              color: piece.color
            }} />
          </div>
        </div>

      </div>
    </div>
  );
}