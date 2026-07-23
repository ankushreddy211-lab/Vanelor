import { OrdersBoard } from "../_components/OrdersBoard";

export default function OrdersPage() {
  return (
    <div className="space-y-12 animate-fade-in text-left text-white">
      
      <div className="border-b border-zinc-900 pb-6 flex justify-between items-baseline">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            06 / House Ledger Transactions
          </h4>
          <h1 className="font-display text-3xl font-bold tracking-widest text-white uppercase mt-1">
            Orders Matrix
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-500">
          SYSTEM CORE: FINAL TRANSFERS & CARRIER ASSIGNMENTS
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg tracking-wider text-white uppercase mb-2">
          Active Settlement Stream
        </h2>
        <p className="text-xs text-zinc-500 max-w-xl">
          Track transaction validation states, process physical component packing queues, and attach tracking identities directly onto client profiles.
        </p>

        <OrdersBoard />
      </div>

    </div>
  );
}