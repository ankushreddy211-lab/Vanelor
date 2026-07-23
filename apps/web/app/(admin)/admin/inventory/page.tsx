import { InventoryDesk } from "../_components/InventoryDesk";

export default function InventoryPage() {
  return (
    <div className="space-y-12 animate-fade-in text-left text-white">
      
      <div className="border-b border-zinc-900 pb-6 flex justify-between items-baseline">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            07 / Logistical Asset Ledger
          </h4>
          <h1 className="font-display text-3xl font-bold tracking-widest text-white uppercase mt-1">
            Inventory Allocations
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-500">
          SYSTEM MATRIX: LOCK INTEGRITY & CAPACITY METRICS
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg tracking-wider text-white uppercase mb-2">
          Physical Allocation Stream
        </h2>
        <p className="text-xs text-zinc-500 max-w-xl">
          Conduct stock unit adjustments, balance incoming collection drop volumes, and audit global piece distribution across customer layers.
        </p>

        <InventoryDesk />
      </div>

    </div>
  );
}