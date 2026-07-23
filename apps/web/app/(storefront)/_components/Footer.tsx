"use client";

import Link from "next/link";
import { Text } from "@valenor/design-system";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    navigation: [
      { label: "Collections", href: "/" },
      { label: "Archive", href: "#chapters" },
      { label: "Journal", href: "/journal" },
      { label: "Membership", href: "/membership/dashboard" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
    connect: [
      { label: "Instagram", href: "https://instagram.com", external: true },
    ],
  };

  return (
    <footer className="w-full border-t border-border bg-bg px-6 py-20 md:px-12 md:py-28 text-fg">
      <div className="mx-auto max-w-7xl">
        {/* Main Grid Structure */}
        <div className="grid grid-cols-2 gap-y-12 sm:grid-cols-4 sm:gap-x-8 md:grid-cols-5">
          
          {/* Brand Pillar Column */}
          <div className="col-span-2 flex flex-col justify-between pr-0 md:col-span-2 md:pr-12">
            <div>
              <Text role="headingLg" as="span" className="font-serif tracking-[0.2em] uppercase text-fg font-medium">
                VALENOR
              </Text>
              <Text role="body" as="p" className="mt-4 max-w-xs text-xs tracking-wide leading-relaxed text-fg-muted uppercase">
                A refusal of the temporary. Considered, tailored, and permanently archived.
              </Text>
            </div>
          </div>

          {/* Column 1: Index */}
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle mb-6">
              Index
            </span>
            <ul className="space-y-4">
              {links.navigation.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="font-mono text-[11px] uppercase tracking-wider text-fg-muted transition-colors duration-200 hover:text-fg"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Connect */}
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle mb-6">
              Connect
            </span>
            <ul className="space-y-4">
              {links.connect.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a 
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[11px] uppercase tracking-wider text-fg-muted transition-colors duration-200 hover:text-fg"
                    >
                      {link.label} ↗
                    </a>
                  ) : (
                    <Link 
                      href={link.href} 
                      className="font-mono text-[11px] uppercase tracking-wider text-fg-muted transition-colors duration-200 hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal Governance */}
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle mb-6">
              Legal
            </span>
            <ul className="space-y-4">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="font-mono text-[11px] uppercase tracking-wider text-fg-muted transition-colors duration-200 hover:text-fg"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Metadata Border Row */}
        <div className="mt-20 flex flex-col items-start justify-between border-t border-border pt-8 space-y-4 sm:flex-row sm:space-y-0 sm:items-center">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-fg-subtle">
            © {currentYear} VALENOR Atelier. All rights reserved.
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-fg-subtle hidden sm:inline">
            Designed in Restraint
          </span>
        </div>
      </div>
    </footer>
  );
}