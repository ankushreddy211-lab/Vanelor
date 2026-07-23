"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  index: string;
}

export default function AdminClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedState = localStorage.getItem("valenor-sidebar-collapsed");
    const savedTheme = (localStorage.getItem("valenor-admin-theme") || "dark") as "dark" | "light";
    
    if (savedState === "true") setIsCollapsed(true);
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    
    setLoading(false);
  }, []);

  // Close mobile menu automatically on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("valenor-sidebar-collapsed", String(nextState));
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("valenor-admin-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const navigation: { group: string; items: NavItem[] }[] = [
    {
      group: "Core Operations",
      items: [
        { index: "01", label: "Executive Dashboard", href: "/admin" },
        { index: "02", label: "Chapters", href: "/admin/chapters" },
        { index: "03", label: "Collections", href: "/admin/collections" },
        { index: "04", label: "Products", href: "/admin/products" },
      ]
    },
    {
      group: "Production & Supply Chain",
      items: [
        { index: "05", label: "Fabric Library", href: "/admin/fabrics" },
        { index: "06", label: "Product Costing", href: "/admin/costing" },
        { index: "07", label: "Tech Packs", href: "/admin/tech-packs" },
        { index: "08", label: "Manufacturers", href: "/admin/manufacturers" },
        { index: "09", label: "Quality Check (QC)", href: "/admin/qc" },
        { index: "10", label: "Campaign Manager", href: "/admin/campaigns" },
      ]
    },
    {
      group: "Allocations & Fulfillment",
      items: [
        { index: "11", label: "Reservation Center", href: "/admin/reservations" },
        { index: "12", label: "Orders Ledger", href: "/admin/orders" },
        { index: "13", label: "Inventory Allocations", href: "/admin/inventory" },
      ]
    },
    {
      group: "House & Audience",
      items: [
        { index: "14", label: "Membership Ledger", href: "/admin/membership" },
        { index: "15", label: "Customer Profiles", href: "/admin/customers" },
        { index: "16", label: "Journal CMS", href: "/admin/journal" },
        { index: "17", label: "Media Vault", href: "/admin/media" },
      ]
    },
    {
      group: "Configuration",
      items: [
        { index: "18", label: "Site Settings", href: "/admin/settings" },
      ]
    }
  ];

  if (loading) return null;

  return (
    <div className="min-h-screen bg-bg text-fg font-sans antialiased transition-colors duration-200">
      
      {/* Mobile Top Header Bar for Small Screens */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-bg-raised border-b border-theme sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded border border-theme bg-bg text-fg-muted hover:text-fg"
            aria-label="Toggle Mobile Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="font-bold text-sm tracking-wide text-fg">VALENOR ADMIN</span>
        </div>
        <Link href="/" className="text-xs uppercase font-mono tracking-wider px-3 py-1 border border-theme bg-bg text-fg-muted">
          Store
        </Link>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 1. Permanent / Responsive Collapsible Sidebar Panel Container */}
      <aside 
        className={`bg-bg-raised border-r border-theme flex flex-col justify-between fixed h-screen z-50 transition-all duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        } ${
          isCollapsed ? "md:w-16" : "md:w-64"
        }`}
      >
        <div>
          {/* Header Area with Control Trigger & Storefront Switcher */}
          <div className="px-4 py-6 border-b border-theme flex items-center justify-between overflow-hidden">
            {(!isCollapsed || mobileOpen) ? (
              <div className="pl-2">
                <Link href="/" className="text-base font-bold text-fg tracking-wide hover:opacity-80 transition-opacity block">VALENOR</Link>
                <div className="text-[11px] text-fg-muted font-medium mt-0.5">House Control Center</div>
              </div>
            ) : (
              <Link href="/" className="mx-auto text-xs font-bold text-fg hidden md:block" title="Switch to Storefront View">V</Link>
            )}
            
            {/* Control Actions Group */}
            <div className="flex items-center gap-1.5">
              {(!isCollapsed || mobileOpen) && (
                <Link 
                  href="/"
                  className="hidden md:inline-block px-2 py-1.5 rounded border border-theme bg-bg font-mono text-[10px] text-fg-muted hover:text-fg hover:border-fg transition-all uppercase tracking-wider"
                  title="Switch to Storefront"
                >
                  Store
                </Link>
              )}

              {/* Desktop Toggle Arrow Button */}
              <button 
                onClick={toggleSidebar}
                className={`hidden md:flex p-2 rounded border border-theme bg-bg text-fg-muted hover:text-fg transition-all items-center justify-center ${
                  isCollapsed ? "mx-auto w-10 h-10" : ""
                }`}
                title="Toggle Sidebar Width"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transform transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              {/* Mobile Close Button */}
              <button 
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-2 rounded border border-theme bg-bg text-fg-muted hover:text-fg"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Nav Links Navigation Group Layer */}
          <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navigation.map((group) => (
              <div key={group.group} className="space-y-1">
                {(!isCollapsed || mobileOpen) && (
                  <h4 className="text-[10px] font-bold text-fg-subtle px-3 uppercase tracking-wider block">
                    {group.group}
                  </h4>
                )}
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link 
                          href={item.href}
                          className={`flex items-center rounded transition-all duration-150 group ${
                            (isCollapsed && !mobileOpen) ? "justify-center py-3" : "gap-2.5 px-3 py-2 text-xs"
                          } ${
                            isActive 
                              ? "bg-bg text-fg font-semibold border-l-2 border-accent-strong rounded-l-none shadow-sm" 
                              : "text-fg-muted hover:text-fg hover:bg-bg/40"
                          }`}
                          title={(isCollapsed && !mobileOpen) ? item.label : undefined}
                        >
                          <span className={`text-[10px] ${isActive ? "text-accent-strong font-bold" : "text-fg-subtle group-hover:text-fg-muted"}`}>
                            {item.index}
                          </span>
                          {(!isCollapsed || mobileOpen) && (
                            <span className="tracking-wide text-xs truncate">{item.label}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Theme Toggle & Operational Footer Layer */}
        <div className="flex flex-col bg-bg-raised">
          {/* Architectural Theme Switcher Action Block */}
          <div className="p-3 border-t border-theme flex justify-center">
            <button 
              onClick={toggleTheme}
              className="w-full py-1.5 px-2 rounded border border-theme bg-bg text-xs font-medium flex items-center justify-center gap-2 text-fg-muted hover:text-fg transition-all shadow-sm"
            >
              {theme === "dark" ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.42 12.42l1.58 1.58M3 12h2.25m13.5 0H21M5.8 18.2l1.58-1.58m12.42-12.42l1.58 1.58M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" /></svg>
                  {(!isCollapsed || mobileOpen) && <span className="tracking-wide">Light Mode</span>}
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
                  {(!isCollapsed || mobileOpen) && <span className="tracking-wide">Dark Mode</span>}
                </>
              )}
            </button>
          </div>

          <div className="p-4 border-t border-theme bg-bg-raised flex items-center justify-between text-xs overflow-hidden">
            {(!isCollapsed || mobileOpen) ? (
              <>
                <div className="truncate pr-2 text-left">
                  <span className="text-fg-subtle block text-[10px] uppercase font-medium">Operator</span>
                  <span className="truncate block max-w-[130px] font-medium text-fg-muted">Active Admin</span>
                </div>
                <Link href="/" className="text-fg-subtle hover:text-error text-[11px] font-medium transition-colors">
                  Exit
                </Link>
              </>
            ) : (
              <div className="w-full text-center text-fg-muted font-bold text-[10px] hidden md:block">ADM</div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Resizing Main Content Display Canvas Window */}
      <main 
        className={`min-h-screen bg-bg transition-all duration-300 ease-in-out pl-0 md:pl-${isCollapsed ? "16" : "64"}`}
      >
        <div className="px-4 sm:px-8 md:px-10 py-8 md:py-10 max-w-5xl mx-auto">
          {/* Injects the high-contrast light utility hooks */}
          <div className={theme === "light" ? "light-theme-overrides" : ""}>
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}