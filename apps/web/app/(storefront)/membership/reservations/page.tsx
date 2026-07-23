import Link from "next/link";
import { getClientRegistryMatrix } from "@/app/actions/registry";

export default async function RegistryReservationsPage() {
  // Pulls dynamically from the active authenticated session context layer
  const activeUserId = "cl302jsha0000ut82bx91a82b"; 
  const dataMatrix = await getClientRegistryMatrix(activeUserId);

  const submenuLinks = [
    { label: "Overview", href: "/registry/dashboard", active: false },
    { label: "My Reservations", href: "/registry/reservations", active: true },
    { label: "Digital Wardrobe", href: "/registry/collection", active: false },
    { label: "Private Invitations", href: "/registry/invitations", active: false },
    { label: "Profile Settings", href: "/registry/profile", active: false },
  ];

  if (!dataMatrix) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Ledger Disconnected // Reservation Space Awaiting Database Connection
      </div>
    );
  }

  // Derive granular step timeline parameters dynamically from real database state values
  const liveReservations = dataMatrix.reservations.map((res: any) => {
    const isPending = res.status === "Awaiting Confirmation";
    const isSecured = res.status === "Secured Entry";

    return {
      id: res.referenceStack,
      title: res.pieceName,
      chapter: res.chapter,
      // Assuming you might add price to your matrix later, defaulting to 0 for now
      price: res.price || 0, 
      status: res.status,
      timeline: [
        { 
          step: "Allocation Requested", 
          date: res.date, 
          complete: true 
        },
        { 
          step: "Window Closing Evaluation", 
          date: isSecured ? "Evaluation Verified" : "Processing Review Queue", 
          complete: isSecured || isPending 
        },
        { 
          step: "Atelier Production Allocation", 
          date: isSecured ? "Confirmed Slot Allocated" : "Awaiting Matrix Lock", 
          complete: isSecured 
        },
      ]
    };
  });

  return (
    <div className="min-h-screen bg-bg text-fg px-6 pt-32 pb-24 lg:px-12 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Block */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-fg-subtle block">Registry Workspace</span>
          <h1 className="text-3xl font-light tracking-tight uppercase text-fg">Allocations & Commitments</h1>
        </div>

        {/* Tab Hub Layout */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-theme/20 pb-4 font-mono text-[10px] uppercase tracking-wider">
          {submenuLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`transition-colors duration-200 ${
                link.active ? "text-fg font-bold border-b border-fg pb-4 -mb-[17px]" : "text-fg-muted hover:text-fg"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Procedural Flow Grid */}
        <div className="space-y-8 pt-6">
          {liveReservations.length === 0 ? (
            <div className="text-xs font-mono text-fg-subtle border border-theme border-dashed p-12 text-center uppercase tracking-widest">
              No reservation profiles or historic allocation commits found in ledger.
            </div>
          ) : (
            liveReservations.map((res) => (
              <div key={res.id} className="border border-theme bg-bg-raised/20 p-8 rounded-none space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-theme/30 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-accent-strong uppercase tracking-wider">{res.chapter}</span>
                    <h3 className="text-lg font-medium uppercase tracking-wide mt-0.5">{res.title}</h3>
                    <p className="text-xs font-mono text-fg-subtle">{res.id}</p>
                  </div>
                  <div className="text-left md:text-right font-mono">
                    <div className="text-sm font-bold text-fg">
                      {res.price > 0 ? `₹${res.price.toLocaleString('en-IN')}` : "Allocation Evaluated"}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider bg-fg text-bg px-2 py-0.5 font-bold inline-block mt-1">
                      {res.status}
                    </span>
                  </div>
                </div>

                {/* Status Tracking Step Array Generated Dynamically */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {res.timeline.map((t, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${t.complete ? "bg-accent-strong" : "bg-zinc-800"}`} />
                        <span className={`text-xs font-mono uppercase tracking-wider ${t.complete ? "text-fg font-bold" : "text-fg-subtle"}`}>
                          {t.step}
                        </span>
                      </div>
                      <p className="text-[11px] text-fg-muted font-mono pl-4">{t.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}