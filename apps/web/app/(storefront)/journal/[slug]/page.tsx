import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";

// Your curated editorial descriptions
const EDITORIAL_DESCRIPTIONS: Record<string, string> = {
  "The Shape of Permanence": "Some garments are designed for seasons. Others are designed for generations. This editorial explores the principles of permanence through proportion, craftsmanship, and intentional design, explaining why longevity begins long before the first piece of fabric is ever cut.",
  "Objects That Age Beautifully": "Time should reveal character, not damage. An exploration of natural materials, patina, and enduring construction methods that allow exceptional garments to mature with grace rather than deteriorate with use.",
  "Dressing Without Noise": "Quiet confidence requires no introduction. This essay examines why restraint, refined proportions, and timeless silhouettes communicate far more than visible branding.",
  "Fibre Chosen Like Stone": "Every fibre is selected with the same scrutiny a jeweller gives a rare stone. From wool and linen to heavyweight cotton, this study explains how material choice defines texture and structure.",
  "Inside the Atelier": "Beyond the finished garment lies a disciplined process of drafting, cutting, pressing, stitching, and inspection. A visual journey through the atelier documenting the precision behind every piece.",
  "The Weight of Detail": "Luxury is rarely found in what is immediately visible. This editorial investigates horn buttons, seam density, and the countless micro-decisions that quietly define exceptional tailoring.",
  "The Architecture of a Collar": "The collar frames the entire garment. Through proportion studies and structural analysis, this article reveals how millimetres of adjustment influence posture and elegance.",
  "Quiet Geometry": "Behind every silhouette exists a hidden system of proportion. This study explores shoulder balance, sleeve pitch, and body length, demonstrating how mathematical precision creates effortless visual harmony.",
  "Chapter IV": "Every Chapter begins as an idea before becoming a collection. Discover the research, sketches, material selection, and iterations that shaped Chapter IV from concept into final expression.",
  "Made Where the Mountains Keep Time": "The pace of the mountains teaches patience. This editorial reflects on how the landscapes, architecture, and quiet rhythm of the Himalayas continue to shape the identity of The House.",
  "The House Archive": "Every Chapter is preserved as part of an ongoing record. The Archive documents past collections, original photography, and the evolving history of The House for future generations.",
  "Notes From the Studio": "Not every experiment reaches production. A curated collection of development notes, rejected prototypes, and design observations that reveal the disciplined process behind every finished garment."
};

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

export default async function EditorialPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: story } = await supabase
    .from("journal_stories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!story) notFound();

  return (
    <main key={story.id} className="min-h-screen bg-bg text-fg pt-32 pb-24 px-6 lg:px-12">
      <article className="max-w-4xl mx-auto space-y-12">
        
        {/* HERO IMAGE */}
        <div className="aspect-[21/9] w-full bg-bg-raised border border-theme relative overflow-hidden">
          <Image 
            src={IMAGE_MAP[story.title] || "/journal/Journal12.png"} 
            alt={story.title} 
            fill 
            className="object-cover mix-blend-luminosity opacity-90"
            priority
          />
        </div>

        {/* HEADER & MANIFEST INTRODUCTION */}
        <div className="space-y-4 text-left border-b border-theme/40 pb-12">
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent-strong">
            {story.category} • {story.read_time_mins || 8} Min Read
          </div>
          <h1 className="text-4xl md:text-5xl font-light uppercase tracking-tight text-fg">
            {story.title}
          </h1>
          {/* Using your curated description instead of database subtitle */}
          <p className="text-xl text-fg-muted font-light leading-relaxed max-w-2xl">
            {EDITORIAL_DESCRIPTIONS[story.title] || story.subtitle}
          </p>
        </div>

        {/* CONTENT */}
        <div className="prose prose-invert prose-stone max-w-none text-fg-muted font-light leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: story.content || "" }} />
        </div>
      </article>
    </main>
  );
}