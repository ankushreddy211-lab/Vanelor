import Link from "next/link";
import Image from "next/image";
import { Hero } from "./_components/Hero";
import { Seam } from "./_components/Seam";
import { Drop } from "./_components/Drop";
import { chapters } from "./_components/chapters";
import { Reserve } from "./_components/Reserve";
import { getAtmosphereImage } from "@/lib/images/atmosphere";
import { createClient } from "@/lib/supabase/server"; 
import { ProductCardCarousel } from "./_components/ProductCardCarousel";

export const revalidate = 3600;

export default async function StorefrontHome() {
  const atmosphereImages = await Promise.all(
    chapters.map(async (chapter) => {
      // Fallback directly to chapter's static previewUrl if query fails or is empty
      if (chapter.previewUrl) return chapter.previewUrl;
      const res = await getAtmosphereImage(chapter.atmosphereQuery);
      if (!res) return chapter.previewUrl || "";
      if (typeof res === "string") return res;
      return (res as any).url || (res as any).previewUrl || (res as any).src || chapter.previewUrl || "";
    })
  );

  let registryCount = 0;
  let isDbOnline = false;
  let productsList: any[] = [];
  let nextDrop: any = null;

  try {
    const supabase = await createClient();
    
    // 1. Fetch registry count
    const { count, error } = await supabase
      .from("User")
      .select("*", { count: "exact", head: true });
    
    if (!error && count !== null) {
      registryCount = count;
      isDbOnline = true;
    }

    // 2. Fetch exactly 3 products for the showcase grid
    const { data: prodData } = await supabase
      .from("products")
      .select("id, title, price, member_price, currency, images, category, created_at")
      .order("created_at", { ascending: false })
      .limit(3);

    if (prodData) {
      productsList = prodData;
    }

    // 3. Fetch latest drop safely
    const { data: dropData } = await supabase
      .from("Collection")
      .select("id, slug, title, liveAt")
      .gt("liveAt", new Date().toISOString())
      .is("archivedAt", null)
      .order("liveAt", { ascending: true })
      .limit(1)
      .single();

    if (dropData && dropData.liveAt) {
      nextDrop = {
        collectionTitle: dropData.title,
        slug: dropData.slug,
        liveAt: new Date(dropData.liveAt),
      };
    }
  } catch (error) {
    console.warn("⚠️ Database unreachable. Defaulting data components.");
  }

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden selection:bg-accent-strong selection:text-bg">
      <Seam />
      <main className="bg-bg text-fg font-sans antialiased transition-colors duration-200">
        
        {/* Hero Section */}
        <Hero />
        
        {/* Collections Showcase with 3 fixed items and independent 3.75s image carousels */}
        <section className="border-t border-theme py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-bg w-full">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-theme pb-6">
              <div>
                <span className="font-mono text-[10px] sm:text-xs text-accent-strong uppercase tracking-[0.3em] block">
                  Atelier Showcase // Design Capsules
                </span>
                <h2 className="font-light text-2xl sm:text-3xl uppercase tracking-tight text-fg mt-1">
                  Collections Archive
                </h2>
              </div>
              <Link
                href="/collections"
                className="font-mono text-xs uppercase tracking-widest text-fg-muted hover:text-fg border border-theme bg-bg-raised px-4 py-2.5 transition-colors text-center"
              >
                View Collection →
              </Link>
            </div>

            {productsList.length === 0 ? (
              <div className="py-16 text-center border border-theme bg-bg-raised/30 font-mono text-xs text-fg-muted uppercase tracking-wider">
                No catalog items indexed at present.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {productsList.map((product: any) => (
                  <ProductCardCarousel key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Chapters Matrix (I — Origin to V — Details) */}
        <div id="chapters" className="w-full">
          {chapters.map((chapter, i) => {
            const isRight = chapter.align === "right";
            const imageSource = atmosphereImages[i] || chapter.previewUrl;

            return (
              <section 
                key={chapter.numeral} 
                className="border-t border-theme py-16 sm:py-24 md:py-36 px-4 sm:px-6 lg:px-12 bg-bg w-full overflow-hidden"
              >
                <div className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center ${isRight ? "lg:grid-flow-dense" : ""}`}>
                  
                  {/* Text Column */}
                  <div className={`lg:col-span-6 space-y-4 sm:space-y-6 ${isRight ? "lg:col-start-7" : ""} w-full min-w-0`}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] sm:text-xs text-accent-strong uppercase tracking-[0.25em] sm:tracking-[0.3em]">
                        {chapter.numeral} // {chapter.eyebrow}
                      </span>
                    </div>
                    
                    <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-light tracking-wide text-fg leading-[1.15]">
                      {chapter.title}
                    </h2>
                    
                    <p className="text-sm sm:text-base md:text-lg font-sans text-fg-muted leading-relaxed pt-1">
                      {chapter.body}
                    </p>

                    <div className="pt-2 font-mono text-[11px] sm:text-xs text-fg-subtle tracking-widest uppercase">
                      {chapter.motifLabel}
                    </div>
                  </div>

                  {/* Responsive Image Frame Column */}
                  <div className={`lg:col-span-6 ${isRight ? "lg:col-start-1" : ""} flex justify-center w-full min-w-0`}>
                    <div className="relative aspect-[4/5] sm:aspect-[9/16] w-full max-w-[100%] sm:max-w-[420px] lg:max-w-[480px] xl:max-w-[520px] border border-theme/40 bg-bg-raised/20 overflow-hidden shadow-2xl">
                      {imageSource ? (
                        <Image
                          src={imageSource}
                          alt={chapter.imageAlt}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 520px"
                          className="object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center p-6 sm:p-8 text-center font-mono text-xs text-fg-subtle">
                          [{chapter.motifLabel} — Atmosphere Matrix]
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </section>
            );
          })}
        </div>

        {/* IV — Next Release Countdown / Drop Section */}
        {nextDrop && (
          <Drop 
            liveAt={nextDrop.liveAt} 
            slug={nextDrop.slug} 
            title={nextDrop.collectionTitle} 
          />
        )}

        {/* VII — The Registry (Reserve Component) */}
        <Reserve />

        {/* Database Status Footer Context */}
        <section className="border-t border-b border-theme py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-bg-raised/10 text-center">
          <div className="max-w-xs mx-auto border border-theme/40 bg-bg p-5 sm:p-6 text-left font-mono text-[11px] uppercase tracking-wide text-fg-muted space-y-2.5 shadow-sm">
            <div className="flex justify-between items-center">
              <span>— Registry Records</span>
              <span className="text-fg font-bold">{registryCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>— System Status</span>
              <span className={`${isDbOnline ? "text-accent-strong" : "text-error"} font-bold`}>
                {isDbOnline ? "LIVE" : "OFFLINE"}
              </span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}