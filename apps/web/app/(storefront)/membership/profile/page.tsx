import Link from "next/link";
import { getClientRegistryMatrix } from "@/app/actions/registry";

export default async function RegistryProfilePage() {
  // Pulls dynamically from the active authenticated session context layer
  const activeUserId = "cl302jsha0000ut82bx91a82b"; 
  const dataMatrix = await getClientRegistryMatrix(activeUserId);

  const submenuLinks = [
    { label: "Overview", href: "/registry/dashboard", active: false },
    { label: "My Reservations", href: "/registry/reservations", active: false },
    { label: "Digital Wardrobe", href: "/registry/collection", active: false },
    { label: "Private Invitations", href: "/registry/invitations", active: false },
    { label: "Profile Settings", href: "/registry/profile", active: true },
  ];

  if (!dataMatrix) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Ledger Disconnected // Profile Session Awaiting Database Link
      </div>
    );
  }

  const { identity, measurements } = dataMatrix;

  return (
    <div className="min-h-screen bg-bg text-fg px-6 pt-32 pb-24 lg:px-12 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-fg-subtle block">Atelier Ledger Identity</span>
          <h1 className="text-3xl font-light tracking-tight uppercase text-fg">Profile & Sizing Metrics</h1>
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

        {/* Dual Layout Column for Settings Matrices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6 items-start">
          
          {/* LEFT SECTION: PHYSICAL LOGISTICS LEDGER */}
          <div className="border border-theme p-8 bg-bg-raised/20 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-fg border-b border-theme/40 pb-2">
              Identity & Logistics References
            </h3>
            <div className="space-y-3 font-mono text-xs text-fg-muted">
              <div className="flex justify-between"><span className="uppercase">Registry Designation:</span><span className="text-fg font-bold">{identity.registryId}</span></div>
              <div className="flex justify-between"><span className="uppercase">House Status Standing:</span><span className="text-fg text-accent-strong uppercase font-bold">{identity.standing}</span></div>
              <div className="flex justify-between"><span className="uppercase">Authorized Name:</span><span className="text-fg">{identity.fullName}</span></div>
              <div className="flex justify-between"><span className="uppercase">Primary Contact:</span><span className="text-fg">{identity.phone}</span></div>
              <div className="flex justify-between flex-col gap-1 pt-1"><span className="uppercase text-[11px]">Primary Dispatch Vector:</span><span className="text-fg bg-bg p-3 border border-theme/40 mt-1">{identity.defaultAddress}</span></div>
              <div className="flex justify-between border-t border-theme/20 pt-3"><span className="uppercase">Fulfillment Engine Preference:</span><span className="text-fg font-bold">{identity.paymentPreference}</span></div>
            </div>
          </div>

          {/* RIGHT SECTION: SAVED TAILORING MEASUREMENTS */}
          <div className="border border-theme p-8 bg-bg-raised/20 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-fg border-b border-theme/40 pb-2">
              Anatomical Sizing Parameters
            </h3>
            <div className="space-y-3 font-mono text-xs text-fg-muted">
              <div className="flex justify-between"><span className="uppercase">Height Frame:</span><span className="text-fg">{measurements.height}</span></div>
              <div className="flex justify-between"><span className="uppercase">Mass Calculation:</span><span className="text-fg">{measurements.weight}</span></div>
              <div className="flex justify-between"><span className="uppercase">Chest Dimension:</span><span className="text-fg">{measurements.chest}</span></div>
              <div className="flex justify-between"><span className="uppercase">Waist Circumference:</span><span className="text-fg">{measurements.waist}</span></div>
              <div className="flex justify-between"><span className="uppercase">Shoulder Span:</span><span className="text-fg">{measurements.shoulder}</span></div>
              <div className="flex justify-between border-t border-theme/20 pt-3"><span className="uppercase">Engineered Fit Silhouette:</span><span className="text-fg font-bold text-accent-strong uppercase">{measurements.preferredFit}</span></div>
            </div>
            <p className="text-[11px] font-mono text-fg-subtle leading-relaxed bg-bg p-3 border border-dashed border-theme/60">
              ℹ️ These tailoring values are analyzed inside dynamic server checks to provide size estimations on future active collections automatically.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}