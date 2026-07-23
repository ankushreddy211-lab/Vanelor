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

export async function listManufacturers() {
  const adminClient = getSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("Manufacturer")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching manufacturers:", error.message);
    return [];
  }

  return data || [];
}

export async function createManufacturer(input: {
  name: string;
  code: string;
  specialization: string;
  leadTimeDays: number;
  moq: number;
  contactPerson: string;
  email: string;
  phone: string;
  status: string;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Not signed in");
  }

  const adminClient = getSupabaseAdminClient();
  const { error: insertError } = await adminClient.from("Manufacturer").insert({
    name: input.name,
    code: input.code,
    specialization: input.specialization,
    lead_time_days: input.leadTimeDays,
    moq: input.moq,
    contact_person: input.contactPerson,
    email: input.email,
    phone: input.phone,
    status: input.status,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath("/admin/manufacturers");
}