"use server";

import { createServerClient } from "@supabase/ssr";
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

export async function getClientRegistryMatrix(userId?: string) {
  try {
    const supabase = await getSupabaseServerClient();
    
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return getFallbackMatrix();
      targetUserId = user.id;
    }

    // Fetch user details from public users table if present
    const { data: userRecord } = await supabase
      .from("users")
      .select("*, reservations(*), orders(*), invitations(*)")
      .eq("id", targetUserId)
      .single();

    if (!userRecord) {
      return getFallbackMatrix();
    }

    return {
      identity: {
        fullName: userRecord.name || userRecord.full_name || "House Member",
        registryId: `REG-${targetUserId.substring(0, 6).toUpperCase()}`,
        standing: "House Member",
        joinedYear: new Date(userRecord.created_at || Date.now()).getFullYear(),
        phone: userRecord.phone_number || "Verified Vector",
        defaultAddress: userRecord.address || "Atelier Core Registry",
        paymentPreference: "UPI / Card Vector"
      },
      measurements: {
        height: "182 cm",
        weight: "74 kg",
        chest: "40 in",
        waist: "32 in",
        shoulder: "18.5 in",
        preferredFit: "Relaxed Geometric"
      },
      reservations: (userRecord.reservations || []).map((res: any) => ({
        id: res.id,
        referenceStack: `VAL-HOLD-${res.id.substring(0, 4).toUpperCase()}`,
        chapter: "Chapter IV",
        pieceName: res.title || "Secured Specimen",
        date: new Date(res.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        status: res.status === "CONFIRMED" ? "Secured Entry" : "Awaiting Confirmation",
      })),
      wardrobe: (userRecord.orders || []).map((ord: any) => ({
        id: ord.id,
        assetRef: `ASSET-#${ord.id.substring(0, 4).toUpperCase()}-2026`,
        chapter: "Chapter III",
        pieceName: ord.title || "Archived Piece",
        specification: "Milled Core",
        status: "✓ Vaulted & Delivered"
      })),
      invitations: (userRecord.invitations || []).map((inv: any) => ({
        id: inv.id,
        title: inv.title || "Exclusive Access Grant",
        chapter: "Private Volume Extension",
        allocationState: inv.status === "LOCKED" ? "Locked" : "Available",
        context: inv.requirement_message || "Allocation requires meeting chapter thresholds."
      })),
      ledgerSummary: {
        volumeI: "Not Joined",
        volumeII: "Not Joined",
        volumeIII: (userRecord.orders || []).length > 0 ? "Purchased" : "Not Joined",
        volumeIV: (userRecord.reservations || []).length > 0 ? "Reserved" : "Not Joined"
      }
    };
  } catch (error) {
    console.warn("⚠️ Registry matrix fallback engaged.");
    return getFallbackMatrix();
  }
}

function getFallbackMatrix() {
  return {
    identity: { 
      fullName: "House Member", 
      registryId: "REG-VALENOR", 
      standing: "Awaiting Verification", 
      joinedYear: 2026, 
      phone: "—", 
      defaultAddress: "Ledger Standby", 
      paymentPreference: "—" 
    },
    measurements: { height: "—", weight: "—", chest: "—", waist: "—", shoulder: "—", preferredFit: "—" },
    reservations: [],
    wardrobe: [],
    invitations: [],
    ledgerSummary: { volumeI: "Not Joined", volumeII: "Not Joined", volumeIII: "Not Joined", volumeIV: "Not Joined" }
  };
}