import { ProductUploadForm } from "../_components/ProductUploadForm";

export default function ProductsPage() {
  return (
    <div className="space-y-12 animate-fade-in text-left text-white">
      
      <div className="border-b border-zinc-900 pb-6 flex justify-between items-baseline">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            04 / Garment Matrix
          </h4>
          <h1 className="font-display text-3xl font-bold tracking-widest text-white uppercase mt-1">
            Product Catalog
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-500">
          SYSTEM CORE: GARMENT LINE PRODUCTION LEDGER
        </div>
      </div>

      <div className="w-full max-w-4xl border border-zinc-900 bg-[#050505] p-8 mx-auto">
        <h2 className="font-display text-lg tracking-wider text-white uppercase mb-2">
          Catalog New Production Piece
        </h2>
        <p className="text-xs text-zinc-500 max-w-xl">
          Populate complex architectural details, textile densities, and historical craft notes for incoming drops.
        </p>

        <ProductUploadForm />
      </div>

    </div>
  );
}