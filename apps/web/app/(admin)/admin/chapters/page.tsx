import { ChapterForm } from "../_components/ChapterForm";

export default function ChaptersPage() {
  return (
    <div className="space-y-12 animate-fade-in text-left text-white">
      
      {/* Editorial Title Header block */}
      <div className="border-b border-zinc-900 pb-6 flex justify-between items-baseline">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            02 / Editorial Chronicles
          </h4>
          <h1 className="font-display text-3xl font-bold tracking-widest text-white uppercase mt-1">
            Chapter Volumes
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-500">
          SYSTEM LAYER: ACTIVE STORY TELLING CONTENT
        </div>
      </div>

      <div className="w-full max-w-3xl border border-zinc-900 bg-[#050505] p-8 mx-auto">
        <h2 className="font-display text-lg tracking-wider text-white uppercase mb-2">
          Establish New Volume Story
        </h2>
        <p className="text-xs text-zinc-500 max-w-xl">
          Create architectural container frameworks mapping lookbooks, early registry reservations, and timed public releases down the house lineage line.
        </p>

        <ChapterForm />
      </div>

    </div>
  );
}