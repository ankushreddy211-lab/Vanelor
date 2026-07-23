"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@valenor/db";

/**
 * Mutates the allocation state token of a reservation request directly in Supabase.
 */
export async function updateReservationStatus(
  id: string,
  status: "CONFIRMED" | "EXPIRED" | "REVOKED"
) {
  try {
    await prisma.reservation.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Supabase Admin update failure:", error);
    return { success: false, message: "Could not mutate database state." };
  }
}