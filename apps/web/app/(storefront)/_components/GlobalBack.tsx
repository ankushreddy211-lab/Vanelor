"use client";

import { useRouter, usePathname } from "next/navigation";

export function GlobalBack() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on the Home page
  if (pathname === "/") return null;

  return (
    <button 
      onClick={() => router.back()}
      className="fixed top-12 left-6 lg:left-12 z-50 group flex items-center gap-3 text-fg-subtle hover:text-fg transition-all duration-500 ease-out"
    >
      {/* Premium Minimalist SVG Arrow */}
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1" 
        strokeLinecap="square" 
        strokeLinejoin="miter"
        className="transform group-hover:-translate-x-2 transition-transform duration-500"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      
      <span className="font-mono text-[9px] uppercase tracking-[0.2em]"></span>
    </button>
  );
}