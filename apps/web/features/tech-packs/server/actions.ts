"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );
}

function getSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function listTechPacks() {
  const adminClient = getSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("TechPack")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tech packs:", error.message);
    return [];
  }

  return data || [];
}

export async function createTechPack(input: {
  styleCode: string;
  name: string;
  season: string;
  targetCost: number;
  cadSketchUrl?: string;
  status: string;
}) {
  const supabase = await getSupabaseServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Not signed in");
  }

  const adminClient = getSupabaseAdminClient();
  const { error: insertError } = await adminClient.from("TechPack").insert({
    style_code: input.styleCode,
    name: input.name,
    season: input.season,
    target_cost: input.targetCost,
    cad_sketch_url: input.cadSketchUrl,
    status: input.status,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath("/admin/tech-packs");
}