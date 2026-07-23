import { Drop } from "../(storefront)/_components/Drop";
import { getLatestUpcomingDrop } from "./server/sync";

export default async function DropsPage() {
  const nextDrop = await getLatestUpcomingDrop();

  if (!nextDrop) {
    return (
      <main className="min-h-screen bg-bg text-fg font-sans antialiased flex items-center justify-center pt-24">
        <p className="font-mono text-xs uppercase tracking-widest text-fg-muted">No upcoming drops found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-fg font-sans antialiased pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="border-b border-theme pb-8 mb-12">
          <span className="font-mono text-xs text-accent-strong uppercase tracking-[0.3em] block mb-2">
            VALENOR // Access Protocol
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-light tracking-wide text-fg">
            Active & Upcoming Drops
          </h1>
        </div>
        
        <Drop 
          liveAt={nextDrop.liveAt instanceof Date ? nextDrop.liveAt.toISOString() : nextDrop.liveAt} 
          slug={nextDrop.slug} 
          title={nextDrop.collectionTitle} 
        />
      </div>
    </main>
  );
}