import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic'; // Prevent caching so data is always fresh on refresh
export const revalidate = 0;

async function getAllProducts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Collections Error]:", error.message);
    return [];
  }

  return data || [];
}

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedCategory = resolvedSearchParams?.category || "All";

  const products = await getAllProducts();

  // Extract unique categories safely
  const rawCategories = Array.from(
    new Set(products.map((p: any) => p?.category).filter(Boolean))
  ) as string[];
  const categories = ["All", ...rawCategories];

  // Filter products case-insensitively
  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter((p: any) => p?.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <main className="min-h-screen bg-bg text-fg font-sans antialiased pt-32 pb-40 px-6 md:px-12 lg:px-16 selection:bg-accent-strong selection:text-bg">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Centered Editorial Header Section */}
        <div className="flex flex-col items-center text-center border-b border-border/60 pb-12 mb-12 gap-6">
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-accent-strong" />
              <span className="font-mono text-[11px] text-accent-strong uppercase tracking-[0.35em]">
                Atelier Catalog — Permanent Collection
              </span>
              <span className="h-px w-8 bg-accent-strong" />
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-fg">
              The Archive
            </h1>
            <p className="font-sans text-sm md:text-base text-fg-muted font-light leading-relaxed max-w-lg mx-auto">
              Uncompromising craftsmanship. Each garment is engineered with high-grade natural fibers, structured silhouettes, and immaculate finishing.
            </p>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs text-fg-muted tracking-widest uppercase pt-2">
            <span>[{filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'}]</span>
            <span className="text-border">/</span>
            <span>Himalayan Atelier</span>
          </div>
        </div>

        {/* Category Selection Filter Tabs */}
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            {categories.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              const queryHref = cat === "All" ? "/collections" : `/collections?category=${encodeURIComponent(cat)}`;

              return (
                <Link
                  key={cat}
                  href={queryHref}
                  className={`px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] transition-all border rounded ${
                    isActive
                      ? "bg-fg text-bg border-fg font-bold"
                      : "bg-bg-raised text-fg-muted border-border/60 hover:border-accent-strong hover:text-fg"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center border border-border/40">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-muted">
              {products.length === 0 ? "No acquisitions currently available in the archive." : "No acquisitions currently available in this category."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {filteredProducts.map((product: any) => {
              const imageList = Array.isArray(product.images) ? product.images : [];
              const primaryImage = imageList.find((img: string) => !img.endsWith('.mp4')) || imageList[0];
              const secondaryImage = imageList.filter((img: string) => !img.endsWith('.mp4'))[1] || primaryImage;

              const currencySymbol = product.currency === 'NPR' ? 'Rs. ' : '$';
              const retailPrice = product.price ? product.price : 0;
              const memberPrice = product.member_price;

              const formattedRetail = retailPrice ? `${currencySymbol}${retailPrice.toLocaleString()}` : "";
              const formattedMember = memberPrice ? `${currencySymbol}${memberPrice.toLocaleString()}` : "";

              return (
                <Link
                  key={product.id}
                  href={`/collections/${product.id}`}
                  className="group flex flex-col focus:outline-none"
                >
                  {/* Image Container with Luxury Zoom & Frame */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-bg-raised border border-border/60 mb-6">
                    {primaryImage ? (
                      <>
                        <Image
                          src={primaryImage}
                          alt={product.title || "VALENOR Garment"}
                          fill
                          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority
                        />
                        {secondaryImage && secondaryImage !== primaryImage && (
                          <Image
                            src={secondaryImage}
                            alt={`${product.title} alternate view`}
                            fill
                            className="absolute inset-0 object-cover object-center opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-mono text-[10px] text-fg-muted uppercase tracking-widest">
                          Visual Pending
                        </span>
                      </div>
                    )}

                    {/* Status Badge Overlay */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-bg/80 backdrop-blur-md border border-border/50 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-fg">
                        {product.category || 'Atelier'}
                      </span>
                    </div>
                  </div>

                  {/* Details Metadata */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="font-display text-xl md:text-2xl font-light tracking-wide text-fg group-hover:text-accent-strong transition-colors duration-300">
                        {product.title}
                      </h2>
                      <div className="flex flex-col items-end">
                        {formattedRetail && (
                          <span className="font-mono text-sm text-fg font-light tracking-wider whitespace-nowrap">
                            {formattedRetail}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {formattedMember ? (
                        <span className="font-mono text-[11px] text-accent-strong uppercase tracking-wider">
                          Member Price: {formattedMember}
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] text-fg-muted uppercase tracking-wider">
                          {product.fit_profile || "Bespoke Silhouette"}
                        </span>
                      )}

                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-strong opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                        Explore Piece →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}