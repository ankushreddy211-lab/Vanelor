import { RegistryLedger } from "../_components/RegistryLedger";

export default function RegistryPage() {
  return (
    <div className="space-y-12 animate-fade-in text-left text-white">
      
      <div className="border-b border-zinc-900 pb-6 flex justify-between items-baseline">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            08 / Brand Inner Circle Log
          </h4>
          <h1 className="font-display text-3xl font-bold tracking-widest text-white uppercase mt-1">
            House Registry
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-500">
          SYSTEM COMPONENT: PRIVILEGED ACCESS PROFILES
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg tracking-wider text-white uppercase mb-2">
          Audience Tier Matrix
        </h2>
        <p className="text-xs text-zinc-500 max-w-xl">
          Track collective customer spend milestones, analyze reservation adherence patterns, and assign high-authority VIP access levels.
        </p>

        <RegistryLedger />
      </div>

    </div>
  );
}