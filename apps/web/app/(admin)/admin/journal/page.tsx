import { JournalForm } from "../_components/JournalForm";

export default function JournalPage() {
  return (
    <div className="space-y-12 animate-fade-in text-left text-white">
      
      <div className="border-b border-zinc-900 pb-6 flex justify-between items-baseline">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            09 / Brand Lineage CMS
          </h4>
          <h1 className="font-display text-3xl font-bold tracking-widest text-white uppercase mt-1">
            Journal CMS
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-500">
          SYSTEM COMPONENT: CAMPAIGN & NARRATIVE DISTRIBUTION
        </div>
      </div>

      <div className="w-full max-w-4xl border border-zinc-900 bg-[#050505] p-8 mx-auto">
        <h2 className="font-display text-lg tracking-wider text-white uppercase mb-2">
          Compose House Publication
        </h2>
        <p className="text-xs text-zinc-500 max-w-xl">
          Establish brand positioning blocks, write design breakdowns for newly scheduled lines, and bind high-end imagery assets to your consumer dashboard channels.
        </p>

        <JournalForm />
      </div>

    </div>
  );
}