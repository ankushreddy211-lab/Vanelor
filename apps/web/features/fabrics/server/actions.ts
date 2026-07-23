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

// Admin client using service role key to safely bypass RLS after manual session/role check
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

export async function listFabrics() {
  const adminClient = getSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("Fabric")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching fabrics:", error.message);
    return [];
  }

  return data || [];
}

export async function createFabric(input: {
  name: string;
  supplier: string;
  gsm: number;
  composition: string;
  costPerMeter: number;
  swatchImageUrl?: string;
}) {
  const supabase = await getSupabaseServerClient();
  
  // 1. Verify user session directly via Supabase
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Not signed in");
  }

  // 2. Verify admin role from PostgreSQL User table
  const { data: dbUser, error: dbError } = await supabase
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  if (dbError || !dbUser || dbUser.role?.toLowerCase() !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  // 3. Insert fabric record using admin client to bypass RLS safely
  const adminClient = getSupabaseAdminClient();
  const { error: insertError } = await adminClient.from("Fabric").insert({
    name: input.name,
    supplier: input.supplier,
    gsm: input.gsm,
    composition: input.composition,
    cost_per_meter: input.costPerMeter,
    swatch_image_url: input.swatchImageUrl,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath("/admin/fabrics");
}