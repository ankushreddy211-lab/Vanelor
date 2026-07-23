// Explicitly wrap MediaVault in curly braces to target the named export properly
import { MediaVault } from "../_components/MediaVault";

export default function MediaPage() {
  return (
    <div className="space-y-12 animate-fade-in text-left text-white">
      
      <div className="border-b border-zinc-900 pb-6 flex justify-between items-baseline">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            10 / Structural Brand Assets
          </h4>
          <h1 className="font-display text-3xl font-bold tracking-widest text-white uppercase mt-1">
            Media Vault
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-500">
          SYSTEM MATRIX: STORAGE INFRASTRUCTURE MANAGEMENT
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg tracking-wider text-white uppercase mb-2">
          Cloud Storage Inventory
        </h2>
        <p className="text-xs text-zinc-500 max-w-xl">
          Review lookbook imagery profiles, inspect active textile snapshot layers, and pull localized URL endpoint loops to deploy manual embeds across layout sections.
        </p>

        <MediaVault />
      </div>

    </div>
  );
}