import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { AdminProductsList } from "./_components/AdminProductsList";

export const revalidate = 0; // Force live data synchronization on every page render context

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
      cookies: { 
        getAll() { return cookieStore.getAll(); }, 
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        } 
      } 
    }
  );

  // 1. Fetch Dynamic System Matrix Metrics Streams concurrently
  const [
    { count: totalReservations },
    { count: confirmedReservations },
    { count: pendingReservations },
    { count: registryCount },
    { data: orderMetrics },
    { data: inventoryMetrics }
  ] = await Promise.all([
    supabase.from("reservations").select("*", { count: "exact", head: true }),
    supabase.from("reservations").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("reservations").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("house_registry").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total_amount, status"),
    supabase.from("inventory_allocations").select("allocated_stock, incoming_stock")
  ]);

  // 2. Compute live operational financial balances
  const totalRevenue = (orderMetrics || [])
    .filter(order => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total_amount), 0);

  const pendingFulfillmentCount = (orderMetrics || [])
    .filter(order => order.status === "pending" || order.status === "confirmed" || order.status === "packed")
    .length;

  // 3. Compute structural inventory allocation sums
  const globalAvailableStock = (inventoryMetrics || [])
    .reduce((sum, row) => sum + (row.allocated_stock || 0), 0);

  const globalIncomingStock = (inventoryMetrics || [])
    .reduce((sum, row) => sum + (row.incoming_stock || 0), 0);

  const dashboardStats = [
    { label: "Accumulated Revenue", value: `₹${totalRevenue.toLocaleString()}`, subtext: "Live Settlement Pool" },
    { label: "Active House Registry", value: `${registryCount || 0} Members`, subtext: "Authenticated Patrons" },
    { label: "Global Stock Available", value: `${globalAvailableStock} Units`, subtext: "Across Active Drop Line" },
    { label: "Incoming Logistics", value: `${globalIncomingStock} Units`, subtext: "Restock Pipeline" },
  ];

  const operationalGrid = [
    { title: "Active Reservations", value: `${totalReservations || 0} Holds`, detail: `${confirmedReservations || 0} Confirmed / ${pendingReservations || 0} Pending` },
    { title: "Fulfillment Queue", value: `${pendingFulfillmentCount} Packages`, detail: "Awaiting Carrier Dispatch" },
  ];

  return (
    <div className="space-y-10 text-left text-fg font-sans pb-32 w-full max-w-full overflow-x-hidden">
      
      {/* Section Header Layout */}
      <div className="border-b border-theme pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent-strong block">
            System Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight uppercase text-fg mt-0.5">
            Executive Pulse
          </h1>
        </div>
        <div className="font-mono text-xs text-fg-muted border border-theme px-3 py-1.5 bg-bg-raised rounded-none">
          Database Status: Sync Live
        </div>
      </div>

      {/* Primary Metrics Matrix (Live Data Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat) => (
          <div key={stat.label} className="bg-bg-raised border border-theme p-5 rounded-none flex flex-col justify-between h-32 shadow-sm">
            <span className="text-[10px] font-mono uppercase tracking-widest text-fg-muted">
              {stat.label}
            </span>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-fg block font-mono">
                {stat.value}
              </span>
              <span className="text-xs mt-1 block text-fg-subtle font-sans">
                {stat.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Operational Real-Time Stream Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {operationalGrid.map((block) => (
          <div key={block.title} className="bg-bg-raised border border-theme p-5 rounded-none space-y-2 shadow-sm">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-fg-subtle">
              {block.title}
            </h3>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-fg font-mono">
                {block.value}
              </div>
              <div className="text-xs text-fg-muted mt-1 font-sans">
                {block.detail}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Existing Products Management List */}
      <section className="border-t border-theme pt-12 space-y-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent-strong block">
            Atelier Management
          </span>
          <h2 className="text-xl sm:text-2xl font-light uppercase tracking-tight text-fg mt-0.5">
            Garment Records & Inventory Management
          </h2>
        </div>

        <div className="bg-bg-raised border border-theme p-4 sm:p-6 rounded-none shadow-sm">
          <AdminProductsList />
        </div>
      </section>

    </div>
  );
}