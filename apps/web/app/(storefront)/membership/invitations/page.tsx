import Link from "next/link";
import { getClientRegistryMatrix } from "@/app/actions/registry";

export default async function RegistryInvitationsPage() {
  const activeUserId = "cl302jsha0000ut82bx91a82b"; 
  const dataMatrix = await getClientRegistryMatrix(activeUserId);

  const submenuLinks = [
    { label: "Overview", href: "/registry/dashboard", active: false },
    { label: "My Reservations", href: "/registry/reservations", active: false },
    { label: "Digital Wardrobe", href: "/registry/collection", active: false },
    { label: "Private Invitations", href: "/registry/invitations", active: true },
    { label: "Profile Settings", href: "/registry/profile", active: false },
  ];

  if (!dataMatrix) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Ledger Disconnected // Awaiting Database Link
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg px-6 pt-32 pb-24 lg:px-12 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-fg-subtle block">House Communications</span>
          <h1 className="text-3xl font-light tracking-tight uppercase text-fg">Private Allocations</h1>
        </div>

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

        {/* Live Invitations Core Grid */}
        <div className="max-w-3xl space-y-6 pt-6">
          {dataMatrix.invitations.length === 0 ? (
            <div className="text-xs font-mono text-fg-subtle border border-theme border-dashed p-12 text-center uppercase tracking-widest">
              No private allocations currently pending for this identity.
            </div>
          ) : (
            dataMatrix.invitations.map((inv: any) => (
              <div key={inv.id} className="border border-theme bg-bg-raised/20 p-8 rounded-none space-y-4">
                <div className="flex justify-between items-start border-b border-theme/20 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-error uppercase tracking-wider">{inv.chapter}</span>
                    <h3 className="text-lg font-medium uppercase text-fg mt-1">{inv.title}</h3>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-error border border-error/40 px-3 py-1 bg-error/5">
                    {inv.allocationState}
                  </span>
                </div>
                <p className="text-xs font-mono text-fg-muted leading-relaxed">
                  {inv.context}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}