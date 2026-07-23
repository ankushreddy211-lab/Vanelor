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

export async function listTechPacksForCosting() {
  const adminClient = getSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("TechPack")
    .select("id, style_code, name, target_cost")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tech packs for costing:", error.message);
    return [];
  }

  return data || [];
}

export async function getBOMItems(techPackId: string) {
  const adminClient = getSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("BOMItem")
    .select("*")
    .eq("tech_pack_id", techPackId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching BOM items:", error.message);
    return [];
  }

  return data || [];
}

export async function addBOMItem(input: {
  techPackId: string;
  materialName: string;
  category: string;
  consumption: number;
  unit: string;
  unitCost: number;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Not signed in");
  }

  const adminClient = getSupabaseAdminClient();
  const { error: insertError } = await adminClient.from("BOMItem").insert({
    tech_pack_id: input.techPackId,
    material_name: input.materialName,
    category: input.category,
    consumption: input.consumption,
    unit: input.unit,
    unit_cost: input.unitCost,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath("/admin/costing");
}