"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Eyebrow, Text } from "@valenor/design-system";

// Curated high-authority archive matrix tracking retired allocations
const historicalArchive = [
  {
    chapter: "Chapter III",
    title: "The Architecture of Silence",
    timeline: "Autumn / Winter 2025",
    allocationLimit: "08 Pieces",
    focus: "Heavy Twills & Structure",
    status: "Fully Allocated"
  },
  {
    chapter: "Chapter II",
    title: "Restraint and Space",
    timeline: "Spring / Summer 2025",
    allocationLimit: "10 Pieces",
    focus: "Raw Silk & Open Weaves",
    status: "Vault Closed"
  },
  {
    chapter: "Chapter I",
    title: "The Genesis Foundations",
    timeline: "Autumn / Winter 2024",
    allocationLimit: "04 Pieces",
    focus: "Undyed Himalayan Wool",
    status: "Historical Record"
  }
];

export default function ArchivePage() {
  return (
    <main className="bg-bg text-fg min-h-screen pt-24 pb-40">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        
        {/* 1. Structural Section Title */}
        <header className="max-w-xl mb-32">
          <Eyebrow numeral="RETROSPECTIVE">The Archive</Eyebrow>
          <h1 className="mt-6 font-serif text-4xl md:text-6xl uppercase tracking-wide font-light">
            The Historical Vault.
          </h1>
          <p className="mt-4 font-mono text-xs uppercase tracking-wider text-fg-muted leading-relaxed">
            A permanent record of retired allocations. These garments have completed their production cycles and exit further manufacturing loops completely.
          </p>
        </header>

        {/* 2. Split Chronological Exhibition Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start border-t border-border/40 pt-16">
          
          {/* Left Column: Big Statement Typography Block (Takes 4/12 columns) */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-fg-subtle block mb-4">
              Lineage Manifesto
            </span>
            <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-wide leading-snug text-fg">
              Permanence means building things that outlast the moment they were made for.
            </h2>
          </div>

          {/* Right Column: Historical Ledger Matrix (Takes 8/12 columns) */}
          <div className="lg:col-span-8 divide-y divide-border/40">
            {historicalArchive.map((item, idx) => (
              <div 
                key={idx} 
                className="py-12 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-6 font-mono text-xs uppercase tracking-wide"
              >
                {/* Chapter Identity Metadata */}
                <div className="md:col-span-3">
                  <span className="text-fg block font-medium tracking-widest">{item.chapter}</span>
                  <span className="text-fg-subtle text-[11px] block mt-1">{item.timeline}</span>
                </div>

                {/* Main Design Focus Content */}
                <div className="md:col-span-6">
                  <h3 className="font-serif text-xl tracking-wide text-fg uppercase normal-case font-light">
                    {item.title}
                  </h3>
                  <p className="text-fg-muted text-[11px] mt-2 tracking-wider">
                    {item.focus} // Core Run Limit: {item.allocationLimit}
                  </p>
                </div>

                {/* Operational Allocation Status */}
                <div className="md:col-span-3 md:text-right flex items-center md:justify-end">
                  <span className="border border-border/60 text-fg-subtle px-3 py-1 text-[10px] tracking-widest">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* 3. Return Hook Bridge */}
        <div className="mt-40 border-t border-border/40 pt-16 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wider text-fg-muted mb-6">
            Looking for current active allocations?
          </p>
          <Link
            href="/collections"
            className="inline-block border border-border bg-fg text-bg px-10 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:bg-transparent hover:text-fg hover:border-border"
          >
            Examine Active Chapter →
          </Link>
        </div>

      </div>
    </main>
  );
}