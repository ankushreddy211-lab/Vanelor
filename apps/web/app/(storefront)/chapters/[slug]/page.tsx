import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
// Adjust these lines at the top of apps/web/app/(storefront)/chapters/[slug]/page.tsx
import { Nav } from "@/app/(storefront)/_components/Nav";
import { Footer } from "@/app/(storefront)/_components/Footer";

export const revalidate = 0; // Live stock allocation numbers

export default async function DropsPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  // Fetch all items currently assigned to the active drop window
  const { data: products } = await supabase
    .from("products")
    .select("*, inventory_allocations(allocated_stock)")
    .order("created_at", { ascending: false });

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-bg text-fg px-6 py-20 lg:py-32 font-sans transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Chapter Meta Block Header */}
          <div className="border-t border-b border-theme py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-fg-subtle block mb-1">Current Allocation</span>
              <h1 className="text-3xl font-light tracking-tight uppercase">Chapter IV</h1>
            </div>
            <div className="font-mono text-xs text-left md:text-right space-y-1 text-fg-muted">
              <div>Winter 2026 Collection</div>
              <div>Allocation Window: <span className="text-accent-strong font-bold">Open</span></div>
              <div className="text-[11px] text-fg-subtle">{products?.length || 0} Distinct Pieces Crafted</div>
            </div>
          </div>

          {/* Luxury Minimal Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {products && products.length > 0 ? (
              products.map((product) => {
                const stock = product.inventory_allocations?.allocated_stock || 0;
                return (
                  <div key={product.id} className="group flex flex-col justify-between space-y-4">
                    <Link href={`/products/${product.id}`} className="space-y-4 block">
                      
                      {/* Large Editorial Photo Casing */}
                      <div className="aspect-[3/4] w-full bg-bg-raised border border-theme relative overflow-hidden rounded flex items-center justify-center transition-all duration-300 group-hover:border-fg-subtle">
                        {product.images && product.images[0] ? (
                          <Image 
                            src={product.images[0]} 
                            alt={product.title} 
                            fill 
                            className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                          />
                        ) : (
                          <span className="text-[10px] font-mono text-fg-subtle uppercase tracking-widest">Atmosphere Frame</span>
                        )}
                      </div>

                      {/* Explicit Typography Grid */}
                      <div className="space-y-1 font-sans">
                        <div className="flex justify-between items-baseline text-sm">
                          <h3 className="font-medium uppercase text-fg tracking-wide truncate max-w-[200px]">{product.title}</h3>
                          <span className="font-mono text-fg-muted">₹{Number(product.price).toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-xs text-fg-subtle font-mono truncate">{product.material || "Hand-Selected Architecture"}</p>
                      </div>

                    </Link>

                    {/* Minimal Interactive Row */}
                    <div className="pt-2 flex items-center justify-between text-xs font-mono">
                      <span className={`text-[10px] uppercase tracking-wider ${stock > 0 ? "text-accent-strong font-bold" : "text-error"}`}>
                        {stock > 0 ? `Allocation Active` : "Sold Out"}
                      </span>
                      <Link 
                        href={`/products/${product.id}`} 
                        className="text-fg-muted hover:text-fg font-bold tracking-wide transition-colors flex items-center gap-1.5"
                      >
                        {stock > 0 ? "Request Reservation →" : "View Archive"}
                      </Link>
                    </div>

                  </div>
                );
              })
            ) : (
              /* Premium Zero-State Framework */
              <div className="col-span-full border border-theme bg-bg-raised/30 py-24 rounded flex flex-col items-center justify-center text-center space-y-3 px-6">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-fg-subtle">
                  Allocation Ledger
                </span>
                <h3 className="text-lg font-light uppercase tracking-wide text-fg">
                  Currently No Drops Live
                </h3>
                <p className="text-xs text-fg-muted font-light max-w-sm leading-relaxed">
                  The house is currently refining the pattern matrices and textile selections for the upcoming chapter window.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}