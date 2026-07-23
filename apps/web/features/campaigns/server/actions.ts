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

export async function listCampaignAssets() {
  const adminClient = getSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("CampaignAsset")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching campaign assets:", error.message);
    return [];
  }

  return data || [];
}

export async function createCampaignAsset(input: {
  title: string;
  campaignName: string;
  channel: string;
  format: string;
  assetUrl: string;
  status: string;
  scheduledDate?: string;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Not signed in");
  }

  const adminClient = getSupabaseAdminClient();
  const { error: insertError } = await adminClient.from("CampaignAsset").insert({
    title: input.title,
    campaign_name: input.campaignName,
    channel: input.channel,
    format: input.format,
    asset_url: input.assetUrl,
    status: input.status,
    scheduled_date: input.scheduledDate ? new Date(input.scheduledDate).toISOString() : null,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath("/admin/campaigns");
}