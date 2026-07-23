"use client";

import Link from "next/link";

interface PieceItem {
  slug: string;
  name: string;
  textile: string;
  allocationValuation: number;
}

interface ActiveVolume {
  title: string;
  subtitle: string;
  windowCloses: string;
  pieces: PieceItem[];
}

interface HistoricalArchive {
  volume: string;
  status: string;
  release: string;
}

export default function ChaptersCatalogPage() {
  // Empty data buckets ready to accept streaming database arrays
  const activeVolume: ActiveVolume | null = null;
  const historicalArchives: HistoricalArchive[] = [];

  if (!activeVolume) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center font-mono text-xs tracking-widest uppercase">
        No Active Release Windows Initialized inside Ledger
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg px-6 pt-32 pb-24 lg:px-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-16">
        
        <div className="border-b border-theme pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-fg-subtle block">Active Collection Index</span>
            <h1 className="text-3xl font-light tracking-tight uppercase text-fg">{activeVolume.title}</h1>
            <p className="text-xs font-mono text-fg-muted">{activeVolume.subtitle}</p>
          </div>
          <div className="bg-bg border border-dashed border-theme p-4 text-right font-mono text-xs">
            <span className="text-accent-strong font-bold block uppercase tracking-wider">🔒 Allocation Window Open</span>
            <span className="text-fg-subtle text-[11px] mt-0.5 block">{activeVolume.windowCloses}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
          {activeVolume.pieces.map((item) => (
            <Link 
              key={item.slug}
              href={`/pieces/${item.slug}`}
              className="group block border border-theme bg-bg-raised/10 p-8 space-y-6 hover:border-fg transition-all duration-300 rounded-none"
            >
              <div className="aspect-[4/5] bg-bg border border-theme/40 relative flex items-center justify-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-fg-subtle group-hover:text-fg transition-colors">
                  View Technical Specimen Matrix
                </span>
              </div>
              <div className="flex justify-between items-start pt-2">
                <div>
                  <h3 className="text-lg font-medium uppercase tracking-wide text-fg group-hover:text-accent-strong transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs font-mono text-fg-subtle mt-1">{item.textile}</p>
                </div>
                <div className="text-right font-mono text-sm font-bold text-fg">
                  ₹{item.allocationValuation.toLocaleString('en-IN')}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {historicalArchives.length > 0 && (
          <div className="space-y-4 pt-12">
            <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-fg-subtle border-b border-theme/30 pb-2">
              Historical Chapter Registry Archive
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
              {historicalArchives.map((archive) => (
                <div key={archive.volume} className="border border-theme/40 bg-bg p-4 flex justify-between items-center opacity-60">
                  <div>
                    <span className="text-fg font-bold block">{archive.volume}</span>
                    <span className="text-[10px] text-fg-subtle">{archive.release}</span>
                  </div>
                  <span className="text-[10px] uppercase border border-theme/60 px-2 py-0.5 text-fg-muted bg-bg-raised">
                    {archive.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}