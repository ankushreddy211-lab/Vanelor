"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export function ProductCardCarousel({ product }: { product: any }) {
  const imageList = Array.isArray(product.images) 
    ? product.images.filter((img: string) => !img.endsWith('.mp4')) 
    : [];
    
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    if (imageList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % imageList.length);
    }, 3750); // 3.75 seconds per image swap

    return () => clearInterval(timer);
  }, [imageList.length]);

  const activeImage = imageList[currentImgIndex] || imageList[0];
  const currencySymbol = product.currency === 'NPR' ? 'Rs. ' : product.currency === 'INR' || !product.currency ? '₹' : '$';

  return (
    <Link 
      href="/collections"
      className="w-full border border-theme bg-bg-raised/30 p-4 space-y-4 hover:border-fg transition-all group block flex flex-col justify-between"
    >
      <div className="relative aspect-[4/5] w-full bg-bg border border-theme overflow-hidden flex items-center justify-center">
        {activeImage ? (
          <Image 
            src={activeImage} 
            alt={product.title} 
            fill 
            className="object-cover transition-all duration-700 group-hover:scale-105" 
          />
        ) : (
          <span className="font-mono text-xs text-fg-subtle">No Asset</span>
        )}

        {/* Image pagination indicator dots */}
        {imageList.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {imageList.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1 transition-all rounded-full ${
                  dotIdx === currentImgIndex ? "w-4 bg-fg" : "w-1 bg-fg/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-xs sm:text-sm text-fg uppercase tracking-wide truncate">
          {product.title}
        </h4>
        
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-theme/30 font-mono text-xs">
          <div>
            <span className="text-[10px] text-fg-subtle uppercase block">Retail</span>
            <span className="text-fg">{product.price ? `${currencySymbol}${product.price.toLocaleString()}` : "—"}</span>
          </div>
          <div>
            <span className="text-[10px] text-fg-subtle uppercase block">Member</span>
            <span className="text-accent-strong font-bold">{product.member_price ? `${currencySymbol}${product.member_price.toLocaleString()}` : "—"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}