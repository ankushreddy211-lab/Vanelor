import Link from "next/link";
import { getClientRegistryMatrix } from "@/app/actions/registry";

export default async function MembershipDashboardPage() {
  // Pull dynamically from your auth session layer
  const activeUserId = "cl302jsha0000ut82bx91a82b"; 
  const dataMatrix = await getClientRegistryMatrix(activeUserId);

  if (!dataMatrix) {
    return (
      <main className="bg-bg text-fg min-h-screen flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Ledger Disconnected // Awaiting Database Link
      </main>
    );
  }

  const { identity, reservations, ledgerSummary } = dataMatrix;

  return (
    <main className="bg-bg text-fg min-h-screen pt-24 pb-40">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        
        {/* Header Metadata */}
        <header className="border-b border-border/40 pb-12 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-fg-subtle block">Membership Dashboard</span>
            <h1 className="mt-4 font-serif text-3xl md:text-5xl uppercase tracking-wide font-light">
              {identity.registryId}
            </h1>
          </div>
          
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-fg-muted">
            <div><span className="text-fg-subtle">Classification:</span> {identity.standing}</div>
            <div><span className="text-fg-subtle">Established:</span> {identity.joinedYear}</div>
            <div><span className="text-fg-subtle">Security:</span> <span className="text-green-500">Active</span></div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Active Allocations Ledger */}
          <div className="lg:col-span-8">
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle mb-6">
              Allocation Ledger Matrix
            </span>
            
            {reservations.length === 0 ? (
              <div className="border border-border p-8 text-center bg-bg-raised">
                <p className="font-mono text-xs uppercase tracking-wider text-fg-muted">
                  No active allocations registered under this configuration.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 border-t border-b border-border/40">
                {reservations.map((alloc: any) => (
                  <div key={alloc.id} className="py-6 grid grid-cols-1 sm:grid-cols-12 items-center font-mono text-xs uppercase tracking-wide">
                    <div className="sm:col-span-2 text-fg-subtle text-[11px]">{alloc.referenceStack}</div>
                    <div className="sm:col-span-5 font-serif text-lg tracking-wide text-fg mt-1 sm:mt-0">
                      {alloc.pieceName} <span className="font-mono text-[10px] text-fg-subtle">Ch. {alloc.chapter}</span>
                    </div>
                    <div className="sm:col-span-3 text-fg-muted text-[11px] mt-1 sm:mt-0">{alloc.date}</div>
                    <div className="sm:col-span-2 text-left sm:text-right mt-2 sm:mt-0">
                      <span className={`px-2 py-1 text-[10px] tracking-widest ${
                        alloc.status === "Secured Entry" ? "bg-fg text-bg" : "border border-border text-fg-subtle"
                      }`}>
                        {alloc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* House Curation Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="border border-border bg-bg-raised p-6">
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle mb-4">
                Atelier Communications
              </span>
              <p className="font-mono text-[11px] uppercase tracking-loose leading-relaxed text-fg-muted">
                Your structural measurements for <strong>{identity.fullName}</strong> are recorded. Current Standing: {identity.standing}.
              </p>
            </div>

            <div className="border border-border p-6 flex flex-col justify-between">
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle mb-2">
                  System Status
                </span>
                <p className="font-mono text-[11px] uppercase tracking-wider text-fg-muted mb-6">
                  Volume III: {ledgerSummary.volumeIII} • Volume IV: {ledgerSummary.volumeIV}
                </p>
              </div>
              <Link
                href="/membership/collection"
                className="w-full text-center border border-border bg-transparent py-3 font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:bg-fg hover:text-bg hover:border-fg"
              >
                View Collection →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}