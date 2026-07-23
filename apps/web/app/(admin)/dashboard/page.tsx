import { Button } from "@valenor/design-system";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <header className="mb-12 flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="font-display text-3xl mb-2">Command Center</h1>
          <p className="font-body text-sm text-fg-muted">System vitals, drop status, and production pipelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/fabrics">
            <Button variant="secondary">Fabric Library</Button>
          </Link>
          <Button variant="primary">New Drop</Button>
        </div>
      </header>

      {/* Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 border border-border bg-bg-raised">
          <p className="text-xs tracking-label uppercase text-fg-muted mb-2">Active Drop</p>
          <p className="font-display text-2xl">Drop 01: Origins</p>
        </div>
        <div className="p-6 border border-border bg-bg-raised">
          <p className="text-xs tracking-label uppercase text-fg-muted mb-2">Live Reservations</p>
          <p className="font-display text-2xl">142</p>
        </div>
        <div className="p-6 border border-border bg-bg-raised">
          <p className="text-xs tracking-label uppercase text-fg-muted mb-2">System Status</p>
          <p className="font-display text-2xl text-success">Operational</p>
        </div>
      </div>

      {/* Production & Operations Quick Nav Grid */}
      <section className="mb-12">
        <h2 className="font-display text-xl mb-6">Production & Supply Chain Hub</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/admin/fabrics" className="p-5 border border-border bg-bg-raised hover:border-fg transition-colors block">
            <p className="text-xs tracking-label uppercase text-fg-muted mb-1">Module 01</p>
            <h3 className="font-display text-lg mb-1">Fabric Library</h3>
            <p className="font-body text-xs text-fg-muted">Manage raw materials, GSM, composition & swatches.</p>
          </Link>
          <Link href="/admin/costing" className="p-5 border border-border bg-bg-raised hover:border-fg transition-colors block">
            <p className="text-xs tracking-label uppercase text-fg-muted mb-1">Module 02</p>
            <h3 className="font-display text-lg mb-1">Product Costing</h3>
            <p className="font-body text-xs text-fg-muted">Automated margins, material costs & net profits.</p>
          </Link>
          <Link href="/admin/tech-packs" className="p-5 border border-border bg-bg-raised hover:border-fg transition-colors block">
            <p className="text-xs tracking-label uppercase text-fg-muted mb-1">Module 03</p>
            <h3 className="font-display text-lg mb-1">Tech Packs</h3>
            <p className="font-body text-xs text-fg-muted">Measurements, trims, stitching & factory notes.</p>
          </Link>
          <Link href="/admin/manufacturers" className="p-5 border border-border bg-bg-raised hover:border-fg transition-colors block">
            <p className="text-xs tracking-label uppercase text-fg-muted mb-1">Module 04</p>
            <h3 className="font-display text-lg mb-1">Manufacturer Tracker</h3>
            <p className="font-body text-xs text-fg-muted">Sample statuses, production lines & delivery dates.</p>
          </Link>
          <Link href="/admin/qc" className="p-5 border border-border bg-bg-raised hover:border-fg transition-colors block">
            <p className="text-xs tracking-label uppercase text-fg-muted mb-1">Module 05</p>
            <h3 className="font-display text-lg mb-1">Quality Check (QC)</h3>
            <p className="font-body text-xs text-fg-muted">Received stock, pass/fail states & defect logging.</p>
          </Link>
          <Link href="/admin/campaigns" className="p-5 border border-border bg-bg-raised hover:border-fg transition-colors block">
            <p className="text-xs tracking-label uppercase text-fg-muted mb-1">Module 06</p>
            <h3 className="font-display text-lg mb-1">Campaign Manager</h3>
            <p className="font-body text-xs text-fg-muted">Hero assets, ad creatives, banners & socials.</p>
          </Link>
        </div>
      </section>

      {/* Recent Activity Ledger */}
      <section>
        <h2 className="font-display text-xl mb-6">Recent Ledger Activity</h2>
        <div className="border border-border">
          <div className="grid grid-cols-4 p-4 border-b border-border bg-bg-raised text-xs tracking-label uppercase text-fg-muted">
            <div>ID</div>
            <div>Status</div>
            <div>Value</div>
            <div>Time</div>
          </div>
          {[1, 2, 3].map((row) => (
            <div key={row} className="grid grid-cols-4 p-4 border-b border-border last:border-0 font-body text-sm">
              <div className="text-fg-subtle">res_clk{row}9x...</div>
              <div>CONFIRMED</div>
              <div>रु 24,000</div>
              <div className="text-fg-muted">Just now</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}