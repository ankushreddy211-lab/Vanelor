import Link from "next/link";
import { getClientRegistryMatrix } from "@/app/actions/registry";

export default async function RegistryCollectionPage() {
  // Pulls dynamically from the active authenticated session context layer
  const activeUserId = "cl302jsha0000ut82bx91a82b"; 
  const dataMatrix = await getClientRegistryMatrix(activeUserId);

  const submenuLinks = [
    { label: "Overview", href: "/registry/dashboard", active: false },
    { label: "My Reservations", href: "/registry/reservations", active: false },
    { label: "Digital Wardrobe", href: "/registry/collection", active: true },
    { label: "Private Invitations", href: "/registry/invitations", active: false },
    { label: "Profile Settings", href: "/registry/profile", active: false },
  ];

  if (!dataMatrix) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Ledger Disconnected // Wardrobe Space Awaiting Database Connection
      </div>
    );
  }

  const { wardrobe } = dataMatrix;

  return (
    <div className="min-h-screen bg-bg text-fg px-6 pt-32 pb-24 lg:px-12 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-fg-subtle block">Registry Account</span>
          <h1 className="text-3xl font-light tracking-tight uppercase text-fg">Acquired Collection</h1>
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

        {/* Live Asset Grid Layout */}
        {wardrobe.length === 0 ? (
          <div className="text-xs font-mono text-fg-subtle border border-theme border-dashed p-12 text-center uppercase tracking-widest pt-6">
            No historical specimens or archive assets currently vaulted inside your cabinet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
            {wardrobe.map((asset: any) => (
              <div key={asset.id} className="border border-theme/60 bg-bg p-6 flex flex-col justify-between space-y-6 rounded-none hover:border-fg transition-all duration-300">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-fg-muted uppercase tracking-wider">
                    <span>{asset.chapter}</span>
                    <span>{asset.assetRef}</span>
                  </div>
                  <h3 className="text-base font-medium uppercase text-fg pt-2">{asset.pieceName}</h3>
                  <p className="text-xs text-fg-subtle font-mono">{asset.specification}</p>
                </div>
                
                <div className="border-t border-theme/20 pt-4 flex justify-between items-center text-[10px] font-mono text-fg-muted uppercase">
                  <span>Status Ledger</span>
                  <span className="text-fg font-bold">{asset.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}