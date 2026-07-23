import { createClient } from "@supabase/supabase-js";

export async function getLatestUpcomingDrop() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  console.log("[Sync] Querying Supabase for products table...");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[Sync Error]:", error.message);
    return null;
  }

  console.log("[Sync Result]:", data);

  if (!data) {
    return null;
  }

  const title = data.title || "New Collection";
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return {
    id: data.id,
    slug: slug,
    liveAt: new Date(data.created_at || Date.now()),
    endsAt: new Date(Date.now() + 7 * 86400000), // 7 days default window
    collectionTitle: title,
  };
}