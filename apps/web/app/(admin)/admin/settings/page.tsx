import { SettingsPanel } from "../_components/SettingsPanel";

export default function SettingsPage() {
  return (
    <div className="space-y-12 animate-fade-in text-left text-white">
      
      <div className="border-b border-zinc-900 pb-6 flex justify-between items-baseline">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            11 / Global System Variables
          </h4>
          <h1 className="font-display text-3xl font-bold tracking-widest text-white uppercase mt-1">
            Site Settings
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-500">
          SYSTEM ANCHOR: CORE SYSTEM ARCHITECTURE CONFIGS
        </div>
      </div>

      <div className="w-full max-w-4xl border border-zinc-900 bg-[#050505] p-8 mx-auto">
        <h2 className="font-display text-lg tracking-wider text-white uppercase mb-2">
          Master System Control Panel
        </h2>
        <p className="text-xs text-zinc-500 max-w-xl">
          Fine-tune active storefront layout parameters, modify fallback indexing records, or engage the total storefront lock override switch instantly.
        </p>

        <SettingsPanel />
      </div>

    </div>
  );
}