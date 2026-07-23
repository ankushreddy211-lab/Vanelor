import { CollectionForm } from "../_components/CollectionForm";

export default function CollectionsPage() {
  return (
    <div className="space-y-12 animate-fade-in text-left text-white">
      
      {/* Structural Heading Header */}
      <div className="border-b border-zinc-900 pb-6 flex justify-between items-baseline">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            03 / Brand Architecture Design Capsules
          </h4>
          <h1 className="font-display text-3xl font-bold tracking-widest text-white uppercase mt-1">
            Collection Lines
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-500">
          SYSTEM MATRIX: STRUCTURAL INVENTORY SEGMENTS
        </div>
      </div>

      <div className="w-full max-w-3xl border border-zinc-900 bg-[#050505] p-8 mx-auto">
        <h2 className="font-display text-lg tracking-wider text-white uppercase mb-2">
          Establish New Design Capsule Line
        </h2>
        <p className="text-xs text-zinc-500 max-w-xl">
          Group similar garments together down structural category paths, mapping collections into their appropriate active house chapters smoothly.
        </p>

        <CollectionForm />
      </div>

    </div>
  );
}