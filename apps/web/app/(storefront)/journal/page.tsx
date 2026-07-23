import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import ScrollSlide from "./scroll-slide";
import HeroCarousel from "@/components/hero-carousel";

export const revalidate = 86400;

const IMAGE_MAP: Record<string, string> = {
  "The Shape of Permanence": "/journal/Journal1.png",
  "Made Where the Mountains Keep Time": "/journal/Journal11.png",
  "Fibre Chosen Like Stone": "/journal/Journal5.png",
  "The Architecture of a Collar": "/journal/Journal8.png",
  "Quiet Geometry": "/journal/Journal9.png",
  "Inside the Atelier": "/journal/Journal6.png",
  "The Weight of Detail": "/journal/Journal7.png",
  "Chapter IV": "/journal/Journal10.png",
  "Objects That Age Beautifully": "/journal/Journal3.png",
  "Dressing Without Noise": "/journal/Journal4.png",
  "Notes From the Studio": "/journal/Journal11.png",
  "The House Archive": "/journal/Journal12.png",
};

export default async function JournalLandingPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: editorials } = await supabase
    .from("journal_stories")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: true })
    .limit(12);

  const featuredStory = editorials?.[0];
  const storiesByCategory = (cat: string) => editorials?.filter(s => s.category === cat) || [];

  return (
    <main className="min-h-screen bg-bg text-fg px-6 pt-32 pb-24 lg:px-12 font-sans antialiased selection:bg-fg selection:text-bg">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="space-y-8 border-b border-theme/40 pb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="max-w-xl space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-fg-subtle">Volume I / Edition I</span>
            <h1 className="text-4xl font-light uppercase tracking-tight text-fg">JOURNAL</h1>
            <p className="text-sm text-fg-muted font-light leading-relaxed">
              Observations from The House. An anthology of twelve flagship editorials exploring craftsmanship, raw material integrity, architectural proportions, and the ideas behind every seasonal Chapter.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 pt-4 border-t border-theme/30 font-mono text-[11px] uppercase tracking-wider text-fg-subtle">
            {["Featured", "Philosophy", "Materials", "Craftsmanship", "Design Studies", "Chapter Stories", "Archive"].map(link => (
              <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`} className="hover:text-fg transition-colors duration-300">{link}</a>
            ))}
          </nav>
        </div>

        {/* FEATURED HERO - Carousel Only */}
        {featuredStory && (
          <section id="featured" className="scroll-mt-28">
            <HeroCarousel />
          </section>
        )}

        {/* ANTHOLOGY SECTIONS */}
        <div className="space-y-24">
          <ScrollSlide><RenderCategorySection id="philosophy" title="Philosophy" label="Essays" stories={storiesByCategory("Philosophy")} /></ScrollSlide>
          <ScrollSlide><RenderCategorySection id="materials" title="Materials" label="References" stories={storiesByCategory("Materials")} /></ScrollSlide>
          <ScrollSlide><RenderCategorySection id="craftsmanship" title="Craftsmanship" label="Atelier Notes" stories={storiesByCategory("Craftsmanship")} /></ScrollSlide>
          <ScrollSlide><RenderCategorySection id="design-studies" title="Design Study" label="Studies" stories={storiesByCategory("Design Study")} /></ScrollSlide>
          <ScrollSlide><RenderCategorySection id="chapter-stories" title="Chapter Stories & Origin" label="Narratives" stories={[...storiesByCategory("Collection Story"), ...storiesByCategory("Origin")]} /></ScrollSlide>
          <ScrollSlide><RenderCategorySection id="archive" title="The House Archive & Studies" label="Records" stories={[...storiesByCategory("Archive"), ...storiesByCategory("Behind the Scenes")]} /></ScrollSlide>
        </div>
      </div>
    </main>
  );
}

function RenderCategorySection({ id, title, label, stories }: { id: string, title: string, label: string, stories: any[] }) {
  if (stories.length === 0) return null;
  return (
    <section id={id} className="space-y-8 scroll-mt-28 border-t border-theme/30 pt-12 text-left">
      <div className="flex justify-between items-baseline border-b border-theme/20 pb-3">
        <h3 className="text-xs font-bold text-fg tracking-[0.2em] uppercase">{title}</h3>
        <span className="font-mono text-[10px] text-fg-subtle uppercase tracking-wider">{stories.length} {label}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {stories.map((story) => (
          <article key={story.id} className="group flex flex-col space-y-4 border-b border-theme/10 pb-8 hover:translate-y-[-5px] transition-transform duration-500">
            <Link href={`/journal/${story.slug}`} className="block space-y-4">
              <div className="aspect-[16/10] bg-bg-raised border border-theme relative overflow-hidden">
                <Image 
                  src={IMAGE_MAP[story.title] || "/journal/Journal12.png"} 
                  alt={story.title} 
                  fill 
                  className="object-cover mix-blend-luminosity opacity-90 transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              <div className="space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent-strong">{story.category} • {story.read_time_mins} Min Read</div>
                <h4 className="text-base font-medium uppercase tracking-wide group-hover:text-accent-strong transition-colors duration-300">{story.title}</h4>
                <p className="text-xs text-fg-muted font-light leading-relaxed line-clamp-2">Detailed craft analysis, pattern parameters, and visual notes.</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}