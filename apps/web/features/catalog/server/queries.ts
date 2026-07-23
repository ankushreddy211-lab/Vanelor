import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Helper to instantiate the Supabase Server Client safely
async function createSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export interface PieceEditorialBlockData {
  id: string;
  type: "HERO" | "RICH_TEXT" | "IMAGE" | "GALLERY" | "QUOTE" | "PRODUCT_REFERENCE";
  content: unknown;
  position: number;
}

export interface PieceVariantData {
  id: string;
  size: string;
  colorway: string;
  sku: string;
  price: number;
}

export interface PieceDetail {
  id: string;
  slug: string;
  title: string;
  editorialCopy: string;
  collection: { title: string; slug: string };
  images: Array<{ url: string; alt: string; position: number }>;
  editorialBlocks: PieceEditorialBlockData[];
  variants: PieceVariantData[];
}

export async function getPieceBySlug(slug: string): Promise<PieceDetail | null> {
  try {
    const supabase = await createSupabaseClient();
    const { data: piece, error } = await supabase
      .from("Piece")
      .select(`
        id,
        slug,
        title,
        editorialCopy,
        collection:Collection(title, slug),
        images(url, alt, position),
        editorialBlocks(id, type, content, position),
        variants(id, size, colorway, sku, price)
      `)
      .eq("slug", slug)
      .single();

    if (error || !piece) return null;

    const collectionData = Array.isArray(piece.collection) 
      ? piece.collection[0] 
      : piece.collection;

    return {
      id: piece.id,
      slug: piece.slug,
      title: piece.title,
      editorialCopy: piece.editorialCopy,
      collection: { 
        title: collectionData?.title ?? "", 
        slug: collectionData?.slug ?? "" 
      },
      images: ((piece.images as any[]) || []).sort((a, b) => a.position - b.position),
      editorialBlocks: ((piece.editorialBlocks as any[]) || []).sort((a, b) => a.position - b.position),
      variants: ((piece.variants as any[]) || []).map((v: any) => ({
        id: v.id,
        size: v.size,
        colorway: v.colorway,
        sku: v.sku,
        price: Number(v.price),
      })),
    };
  } catch (error) {
    return null;
  }
}

export interface CollectionListItem {
  id: string;
  slug: string;
  title: string;
}

export async function listCollections(): Promise<CollectionListItem[]> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("Collection")
      .select("id, slug, title")
      .is("archivedAt", null)
      .order("createdAt", { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (error) {
    return [];
  }
}

export async function listPiecesByCollection(collectionId: string): Promise<any[]> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("Piece")
      .select("id, slug, title, price, member_price, currency, images")
      .eq("collectionId", collectionId)
      .is("archivedAt", null)
      .order("createdAt", { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (error) {
    return [];
  }
}

export interface UpcomingDrop {
  id: string;
  slug: string;
  collectionTitle: string;
  liveAt: Date;
}

export async function getLatestUpcomingDrop(): Promise<UpcomingDrop | null> {
  try {
    const supabase = await createSupabaseClient();
    const { data: drop, error } = await supabase
      .from("Collection")
      .select("id, slug, title, liveAt")
      .gt("liveAt", new Date().toISOString())
      .is("archivedAt", null)
      .order("liveAt", { ascending: true })
      .limit(1)
      .single();

    if (error || !drop || !drop.liveAt) return null;

    return {
      id: drop.id,
      slug: drop.slug,
      collectionTitle: drop.title,
      liveAt: new Date(drop.liveAt),
    };
  } catch (error) {
    return null;
  }
}