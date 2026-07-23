import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getLatestUpcomingDrop() {
  console.log("[Query] Fetching latest product from schema...");
  
  const { data, error } = await supabase
    .from("products")
    .select("id, title, created_at, images, video_url, price")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[Query Error]:", error.message);
    return null;
  }

  console.log("[Query Success] Product found:", data);

  if (!data || !data.title) return null;

  return {
    slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    collectionTitle: data.title,
    liveAt: data.created_at,
  };
}