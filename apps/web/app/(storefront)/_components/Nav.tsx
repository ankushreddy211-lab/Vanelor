"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthNavLink } from "../../../components/media/navigation/AuthNavLink";

interface NavProps {
  isAdmin?: boolean;
}

export function Nav({ isAdmin = false }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isNotHome = pathname && pathname !== "/" && pathname !== "";
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer automatically when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* GLOBAL BACK BUTTON - Adjusted size and padding for clean touch targets on mobile */}
      {isNotHome && (
        <button 
          onClick={() => router.back()}
          className="fixed top-20 left-4 sm:left-6 md:left-12 z-[70] group flex items-center gap-2 sm:gap-3 border border-border bg-bg/90 px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-md transition-all duration-300 hover:border-fg/50 shadow-lg cursor-pointer"
          aria-label="Go back"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className="transform group-hover:-translate-x-1 transition-transform duration-300">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-fg">Back</span>
        </button>
      )}

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 md:px-12 md:py-5">
          
          {/* Brand Logo */}
          <Link href="/" className="font-display text-base sm:text-lg tracking-[0.15em] text-fg transition-opacity hover:opacity-80">
            VALENOR
          </Link>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden gap-8 lg:gap-10 md:flex">
            <Link href="/#chapters" className="label transition-colors hover:text-fg">The House</Link>
            <Link href="/collections" className="label transition-colors hover:text-fg">Collections</Link>
            <Link href="/journal" className="label transition-colors hover:text-fg">Journal</Link>
            <Link href="/membership/acquire" className="label transition-colors hover:text-fg">Membership</Link>
          </nav>
          
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Admin Switcher Button - visible only for admins */}
            {isAdmin && (
              <Link 
                href="/admin" 
                className="font-mono text-[11px] sm:text-xs uppercase tracking-widest text-fg-muted hover:text-fg border border-border px-2.5 py-1.5 sm:px-3 bg-bg/40 hover:bg-bg transition-colors"
                title="Switch to Admin Dashboard"
              >
                Admin
              </Link>
            )}

            <div className="hidden sm:block">
              <AuthNavLink />
            </div>

            {/* Mobile Menu Trigger Button (Hamburger) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 border border-border bg-bg/50 focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <span className={`w-4 h-px bg-fg transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[2px]' : '-translate-y-1'}`} />
              <span className={`w-4 h-px bg-fg transition-opacity duration-300 my-1 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`w-4 h-px bg-fg transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[2px]' : 'translate-y-1'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Overlay Drawer */}
      <div className={`fixed inset-0 z-[80] bg-bg transition-all duration-500 md:hidden flex flex-col justify-between px-6 py-12 ${
        mobileMenuOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-4"
      }`}>
        <div className="flex items-center justify-between border-b border-border pb-5">
          <span className="font-display text-lg tracking-[0.15em] text-fg">VALENOR ATELIER</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 border border-border flex items-center justify-center font-mono text-xs uppercase text-fg"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col space-y-6 text-center my-auto">
          <Link href="/#chapters" className="font-display text-2xl tracking-wider text-fg hover:text-accent-strong transition-colors">
            The House
          </Link>
          <Link href="/collections" className="font-display text-2xl tracking-wider text-fg hover:text-accent-strong transition-colors">
            Collections
          </Link>
          <Link href="/journal" className="font-display text-2xl tracking-wider text-fg hover:text-accent-strong transition-colors">
            Journal
          </Link>
          <Link href="/membership/acquire" className="font-display text-2xl tracking-wider text-fg hover:text-accent-strong transition-colors">
            Membership
          </Link>
        </nav>

        <div className="border-t border-border pt-6 flex flex-col gap-4 text-center">
          <div className="flex justify-center">
            <AuthNavLink />
          </div>
          <span className="font-mono text-[10px] text-fg-muted uppercase tracking-[0.3em]">
            Himalayan Luxury Archive
          </span>
        </div>
      </div>
    </>
  );
}