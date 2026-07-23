import { ReservationDesk } from "../_components/ReservationDesk";

export default function ReservationsPage() {
  return (
    <div className="space-y-12 animate-fade-in text-left text-white">
      
      <div className="border-b border-zinc-900 pb-6 flex justify-between items-baseline">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            05 / Allocation Gateway
          </h4>
          <h1 className="font-display text-3xl font-bold tracking-widest text-white uppercase mt-1">
            Reservation Center
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-500">
          SECURE PROTOCOL: PRIVATE PATRON LEDGER WINDOW
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg tracking-wider text-white uppercase mb-2">
          Active Allocation Stream
        </h2>
        <p className="text-xs text-zinc-500 max-w-xl">
          Track temporary inventory holds, override structural statuses, and extend timed early access privileges for registry patrons.
        </p>

        <ReservationDesk />
      </div>

    </div>
  );
}