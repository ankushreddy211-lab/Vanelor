import Link from "next/link";
import { redirect } from "next/navigation";
import { getClientRegistryMatrix } from "@/app/actions/registry";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MembershipDashboardPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const status = resolvedParams.status;
  const paymentId = resolvedParams.payment_id;

  // STRICT PAYMENT GUARD: Block access unless verified via checkout protocol
  if (status !== "verified" && !paymentId) {
    redirect("/membership/acquire");
  }

  const activeUserId = "cl302jsha0000ut82bx91a82b"; 
  const dataMatrix = await getClientRegistryMatrix(activeUserId);

  const submenuLinks = [
    { label: "Overview", href: "/membership/dashboard", active: true },
    { label: "My Reservations", href: "/membership/reservations", active: false },
    { label: "Digital Wardrobe", href: "/membership/collection", active: false },
    { label: "Private Invitations", href: "/membership/invitations", active: false },
    { label: "Profile Settings", href: "/membership/profile", active: false },
  ];

  if (!dataMatrix) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Ledger Disconnected // Awaiting Supabase Link
      </div>
    );
  }

  const { identity, reservations, wardrobe, invitations, ledgerSummary } = dataMatrix;

  return (
    <div className="min-h-screen bg-bg text-fg px-6 pt-32 pb-24 lg:px-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 1. MEMBERSHIP CREDENTIAL HEADLINE */}
        <div className="border-b border-theme pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-fg-subtle block">Atelier Membership Workspace</span>
            <h1 className="text-3xl font-light tracking-tight uppercase text-fg">
              Welcome, {identity.fullName}
            </h1>
          </div>
          <div className="font-mono text-[11px] text-fg-muted flex gap-8">
            <div>
              <span className="text-fg-subtle block text-[9px] uppercase tracking-wider">Member Sequence</span>
              <span>Since {identity.joinedYear}</span>
            </div>
            <div>
              <span className="text-fg-subtle block text-[9px] uppercase tracking-wider">House Standing</span>
              <span className="text-accent-strong font-bold uppercase">Founding Circle (Verified)</span>
            </div>
          </div>
        </div>

        {/* 2. SUB-NAVIGATION HUB BAR */}
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

        {/* 3. DUAL SEGMENT LAYOUT MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-6">
          
          {/* LEFT CONTENT SECTOR */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* ACTIVE SECURED ALLOCATIONS */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-fg-subtle border-b border-theme/30 pb-2">
                Active Chapter Allocations
              </h3>
              {reservations.length === 0 ? (
                <div className="text-xs font-mono text-fg-subtle border border-theme border-dashed p-6 text-center uppercase">
                  No active processing allocation locks found.
                </div>
              ) : (
                reservations.map((res: any) => (
                  <div key={res.id} className="border border-theme bg-bg-raised/40 p-6 flex justify-between items-center rounded-none">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-accent-strong uppercase tracking-wider">{res.chapter}</span>
                      <h4 className="text-sm font-medium uppercase text-fg">{res.pieceName}</h4>
                      <p className="text-[11px] text-fg-subtle font-mono">{res.date} • Reference: {res.referenceStack}</p>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-fg text-bg px-3 py-1 font-bold">
                      {res.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* MY COLLECTION LEDGER */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-fg-subtle border-b border-theme/30 pb-2">
                My Collection Ledger (Digital Wardrobe)
              </h3>
              {wardrobe.length === 0 ? (
                <div className="text-xs font-mono text-fg-subtle border border-theme border-dashed p-6 text-center uppercase">
                  No historical collection specimens vaulted.
                </div>
              ) : (
                wardrobe.map((item: any) => (
                  <div key={item.id} className="border border-theme/60 bg-bg p-6 flex justify-between items-center rounded-none hover:border-fg-subtle transition-all duration-300">
                    <div>
                      <span className="text-[10px] font-mono text-fg-muted uppercase tracking-wider">{item.chapter}</span>
                      <h4 className="text-sm font-medium uppercase text-fg mt-0.5">{item.pieceName}</h4>
                      <p className="text-[10px] font-mono text-fg-subtle mt-0.5">{item.specification} • {item.assetRef}</p>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted">
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR SECTOR */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* CHAPTER LEDGER */}
            <div className="border border-theme bg-bg-raised/30 p-6 space-y-4 rounded-none">
              <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-fg border-b border-theme/40 pb-2">
                Chapter Ledger
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {Object.entries(ledgerSummary).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-1 border-b border-theme/10">
                    <span className="text-fg-muted font-bold uppercase">{key}</span>
                    <span className={`text-[11px] ${val !== 'Not Joined' ? 'text-accent-strong font-bold' : 'text-fg-subtle'}`}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SYSTEM INVITATIONS BUFFER */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-fg-subtle border-b border-theme/30 pb-2">
                Atelier Invitations
              </h3>
              {invitations.length === 0 ? (
                <div className="text-[10px] font-mono text-fg-muted italic">No active invitations found.</div>
              ) : (
                invitations.slice(0, 1).map((inv: any) => (
                  <div key={inv.id} className="border border-theme bg-bg-raised/10 p-4 space-y-2 rounded-none">
                    <h4 className="text-xs uppercase font-medium text-fg">{inv.title}</h4>
                    <div className="flex justify-between items-center pt-2 text-[10px] font-mono">
                      <span className="text-fg-subtle uppercase tracking-wider">{inv.allocationState}</span>
                      <span className="text-fg-subtle truncate max-w-[120px]">{inv.chapter}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}