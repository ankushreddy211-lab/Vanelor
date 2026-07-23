"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  price: number;
  member_price?: number;
  currency: string;
  category?: string;
  sizes?: string[];
  images: string[];
  craft_notes: string;
  material: string;
  construction: string;
  details: string;
  weight_g: number;
  fit_profile: string;
  care_guide: string;
  inventory_status: string;
}

interface ProductClientViewProps {
  product: Product;
  isMember?: boolean; // Pass true if user belongs to the House Registry
}

export default function ProductClientView({ product, isMember = false }: ProductClientViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : "Standard / Custom Tailored"
  );
  
  const mediaList = Array.isArray(product.images) ? product.images : [];
  const sizesList = Array.isArray(product.sizes) ? product.sizes : [];
  
  const currencySymbol = product.currency === 'NPR' ? 'Rs. ' : '$';
  const formattedRetailPrice = product.price ? `${currencySymbol}${product.price.toLocaleString()}` : "";
  const formattedMemberPrice = product.member_price ? `${currencySymbol}${product.member_price.toLocaleString()}` : "";

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  return (
    <main className="min-h-screen bg-bg text-fg font-sans antialiased pt-20 md:pt-32 pb-24 md:pb-40 px-4 sm:px-6 md:px-12 lg:px-16 selection:bg-accent-strong selection:text-bg">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 md:mb-12">
          <Link 
            href="/collections" 
            className="font-mono text-xs text-fg-muted uppercase tracking-[0.25em] hover:text-accent-strong transition-colors inline-flex items-center gap-2"
          >
            <span>←</span> Return to Archive
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 items-start">
          
          {/* LEFT SECTION: Interactive Carousel / Main Display with Arrows */}
          <div className="w-full lg:col-span-7 flex flex-col gap-4 md:gap-6 lg:sticky lg:top-28">
            <div className="relative group w-full aspect-[4/5] bg-bg-muted border border-border/60 overflow-hidden shadow-xl md:shadow-2xl">
              {mediaList.length > 0 ? (
                mediaList[activeIndex]?.endsWith('.mp4') ? (
                  <video
                    src={mediaList[activeIndex]}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={mediaList[activeIndex]}
                    alt={`${product.title} - View ${activeIndex + 1}`}
                    fill
                    className="object-cover object-center transition-opacity duration-500"
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-xs text-fg-muted uppercase tracking-widest">
                    Visual Archive Pending
                  </span>
                </div>
              )}

              {/* Carousel Left / Right Arrows */}
              {mediaList.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    aria-label="Previous image"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-bg/70 backdrop-blur-md border border-border/60 text-fg flex items-center justify-center opacity-70 hover:opacity-100 hover:border-accent-strong transition-all duration-300"
                  >
                    <span className="font-mono text-base">←</span>
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next image"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-bg/70 backdrop-blur-md border border-border/60 text-fg flex items-center justify-center opacity-70 hover:opacity-100 hover:border-accent-strong transition-all duration-300"
                  >
                    <span className="font-mono text-base">→</span>
                  </button>
                </>
              )}

              {/* Index Badge */}
              <div className="absolute bottom-4 right-4 bg-bg/80 backdrop-blur-md border border-border/50 px-3 py-1 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-fg">
                0{activeIndex + 1} / 0{mediaList.length}
              </div>
            </div>

            {/* Thumbnail Navigation Strip */}
            {mediaList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none w-full">
                {mediaList.map((url, idx) => {
                  const isVideo = url.endsWith('.mp4');
                  const isActive = activeIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative flex-shrink-0 w-16 h-20 md:w-20 md:h-24 bg-bg-muted border transition-all overflow-hidden ${
                        isActive ? 'border-accent-strong opacity-100 ring-1 ring-accent-strong' : 'border-border/60 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {isVideo ? (
                        <div className="w-full h-full bg-fg/10 flex items-center justify-center font-mono text-[9px]">VIDEO</div>
                      ) : (
                        <Image
                          src={url}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SECTION: Comprehensive Details & Specifications */}
          <div className="w-full lg:col-span-5 flex flex-col space-y-8 md:space-y-12">
            
            <div className="border-b border-border/60 pb-6 md:pb-8 space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] md:text-[11px] text-accent-strong uppercase tracking-[0.3em]">
                    {product.inventory_status === 'available' ? 'Available for Acquisition' : product.inventory_status || 'Exclusive'}
                  </span>
                  {product.category && (
                    <span className="bg-bg-raised border border-border px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-fg-muted">
                      {product.category}
                    </span>
                  )}
                </div>
                <span className="font-mono text-[11px] md:text-xs text-fg-muted tracking-widest">
                  {product.weight_g ? `${product.weight_g}G` : ''}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-fg leading-tight">
                {product.title}
              </h1>

              {/* Conditional Pricing Display based on Membership Status */}
              <div className="space-y-2 pt-1">
                {isMember && formattedMemberPrice ? (
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl md:text-2xl text-fg font-light tracking-wider line-through opacity-50">
                        {formattedRetailPrice}
                      </span>
                      <span className="bg-accent-strong/10 border border-accent-strong/30 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-strong rounded">
                        Registry Privilege Active
                      </span>
                    </div>
                    <div className="font-mono text-2xl md:text-3xl text-accent-strong font-medium tracking-wider">
                      {formattedMemberPrice}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formattedRetailPrice && (
                      <div className="font-mono text-xl md:text-2xl text-fg font-light tracking-wider">
                        {formattedRetailPrice} <span className="text-xs text-fg-muted uppercase tracking-widest font-normal">Retail Price</span>
                      </div>
                    )}
                    {formattedMemberPrice && (
                      <div className="font-mono text-sm md:text-base text-accent-strong font-medium tracking-wider flex items-center gap-2 pt-1">
                        <span>{formattedMemberPrice}</span>
                        <span className="bg-bg-muted border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-fg-muted rounded">
                          House Member Rate
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {product.fit_profile && (
                <div className="pt-2">
                  <span className="inline-block bg-bg-muted border border-border px-3 py-1 font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-fg-muted">
                    Fit: {product.fit_profile}
                  </span>
                </div>
              )}
            </div>

            {/* Sizes Selection Selector */}
            {sizesList.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs text-fg uppercase tracking-[0.25em]">Available Sizing</h3>
                  <span className="font-mono text-[10px] text-fg-muted uppercase">Select preference</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizesList.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-2 font-mono text-xs uppercase tracking-wider border transition-all ${
                          isSelected 
                            ? 'bg-fg text-bg border-fg font-bold' 
                            : 'bg-bg-raised text-fg-muted border-border/60 hover:border-accent-strong hover:text-fg'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.craft_notes && (
              <div className="space-y-2 md:space-y-3">
                <h3 className="font-mono text-xs text-fg uppercase tracking-[0.25em]">Craft & Character</h3>
                <p className="font-sans text-sm md:text-base text-fg-muted font-light leading-relaxed">
                  {product.craft_notes}
                </p>
              </div>
            )}

            {product.material && (
              <div className="space-y-2 md:space-y-3 pt-5 md:pt-6 border-t border-border/40">
                <h3 className="font-mono text-xs text-fg uppercase tracking-[0.25em]">Composition & Material</h3>
                <div className="font-sans text-sm text-fg-muted font-light whitespace-pre-line leading-relaxed">
                  {product.material}
                </div>
              </div>
            )}

            {product.construction && (
              <div className="space-y-2 md:space-y-3 pt-5 md:pt-6 border-t border-border/40">
                <h3 className="font-mono text-xs text-fg uppercase tracking-[0.25em]">Construction Details</h3>
                <div className="font-sans text-sm text-fg-muted font-light whitespace-pre-line leading-relaxed">
                  {product.construction}
                </div>
              </div>
            )}

            {product.details && (
              <div className="space-y-2 md:space-y-3 pt-5 md:pt-6 border-t border-border/40">
                <h3 className="font-mono text-xs text-fg uppercase tracking-[0.25em]">Design Elements</h3>
                <div className="font-sans text-sm text-fg-muted font-light whitespace-pre-line leading-relaxed">
                  {product.details}
                </div>
              </div>
            )}

            {product.care_guide && (
              <div className="space-y-2 md:space-y-3 pt-5 md:pt-6 border-t border-border/40">
                <h3 className="font-mono text-xs text-fg uppercase tracking-[0.25em]">Care & Preservation</h3>
                <p className="font-sans text-xs md:text-sm text-fg-muted font-light leading-relaxed">
                  {product.care_guide}
                </p>
              </div>
            )}

            <div className="pt-6 md:pt-8 border-t border-border/85 flex flex-col gap-3">
              <Link 
                href={`/waiting-list?product=${encodeURIComponent(product.title)}&size=${encodeURIComponent(selectedSize)}`}
                className="w-full bg-fg text-bg py-4 text-center font-mono text-xs uppercase tracking-[0.25em] font-medium hover:bg-accent-strong transition-colors block"
              >
                Order Piece {selectedSize ? `(${selectedSize})` : ""}
              </Link>
              {!isMember && (
                <Link 
                  href="/membership" 
                  className="w-full bg-bg-muted border border-border text-fg py-3.5 text-center font-mono text-xs uppercase tracking-[0.25em] font-medium hover:border-accent-strong transition-colors block"
                >
                  Join Membership
                </Link>
              )}
              
              <p className="font-mono text-[10px] text-center text-fg-muted uppercase tracking-widest pt-2">
                Complimentary global shipping & bespoke packaging included.
              </p>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}