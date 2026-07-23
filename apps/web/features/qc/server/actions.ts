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

export async function listQCInspections() {
  const adminClient = getSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("QCInspection")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching QC inspections:", error.message);
    return [];
  }

  return data || [];
}

export async function createQCInspection(input: {
  batchCode: string;
  styleCode: string;
  inspectorName: string;
  totalInspected: number;
  passedUnits: number;
  failedUnits: number;
  defectCategory: string;
  status: string;
  notes?: string;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Not signed in");
  }

  const adminClient = getSupabaseAdminClient();
  const { error: insertError } = await adminClient.from("QCInspection").insert({
    batch_code: input.batchCode,
    style_code: input.styleCode,
    inspector_name: input.inspectorName,
    total_inspected: input.totalInspected,
    passed_units: input.passedUnits,
    failed_units: input.failedUnits,
    defect_category: input.defectCategory,
    status: input.status,
    notes: input.notes,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath("/admin/qc");
}