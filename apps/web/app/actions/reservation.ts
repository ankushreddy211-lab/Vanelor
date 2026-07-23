"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@valenor/db"; // Maps directly to your monorepo shared database client

export interface ReservationResponse {
  success: boolean;
  message: string;
}

/**
 * Commits a high-authority client garment allocation hold securely to the Supabase instance.
 * Aligns perfectly with the core relational architecture schema.
 */
export async function createReservation(
  prevState: any,
  formData: FormData
): Promise<ReservationResponse> {
  const email = formData.get("email");
  const size = (formData.get("size") as string) || "M";
  const colorway = (formData.get("colorway") as string) || "Raw";
  const pieceSlug = (formData.get("pieceSlug") as string) || "the-overcoat";

  if (!email || typeof email !== "string") {
    return {
      success: false,
      message: "A valid identification address is required.",
    };
  }

  try {
    // 1. Resolve or initialize the User record shell to comply with the userId requirement
    let user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.trim().toLowerCase(),
          name: "House Member",
        },
        select: { id: true }
      });
    }

    // 2. Locate the specific target Variant from the catalog to draw price snapshots
    const targetVariant = await prisma.variant.findFirst({
      where: {
        piece: { slug: pieceSlug },
        size: size,
        colorway: colorway
      },
      select: { id: true, price: true }
    });

    if (!targetVariant) {
      return {
        success: false,
        message: "The requested design garment specimen configuration could not be found.",
      };
    }

  // 3. Execute the hold creation within a safe database transaction block
  const allocationHoldDuration = 20; // 20 minutes allocation lock window
  const expirationTimestamp = new Date();
  expirationTimestamp.setMinutes(expirationTimestamp.getMinutes() + allocationHoldDuration);

  await prisma.reservation.create({
    data: {
      userId: user.id,
      status: "PENDING",
      expiresAt: expirationTimestamp,
      lines: {
        create: {
          variantId: targetVariant.id,
          quantity: 1,
          unitPriceSnapshot: targetVariant.price
        }
      },
      events: {
        create: {
          fromStatus: "INITIALIZATION",
          toStatus: "PENDING",
          metadata: { engineSource: "ReservationWizardFlow" }
        }
      }
    }
  });

    // 4. Invalidate storefront cache arrays cleanly
    revalidatePath("/chapters");
    revalidatePath("/registry/dashboard");

    return {
      success: true,
      message: "Garment allocation held inside the House Registry Ledger.",
    };
  } catch (error: any) {
    console.error("Supabase Database allocation mutation failure:", error);
    return {
      success: false,
      message: "An error occurred while securing your allocation matrix.",
    };
  }
}