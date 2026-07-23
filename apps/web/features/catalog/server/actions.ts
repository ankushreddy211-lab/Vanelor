"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@valenor/db";
import { getSession } from "../../../lib/auth/session";
import { assertCanForUser } from "../../../lib/auth/rbac";

async function requireCaller(action: string) {
  const session = await getSession();
  if (!session) throw new Error("Not signed in");
  await assertCanForUser(session.userId, action);
  return session;
}

export async function createCollection(input: { slug: string; title: string; description: string }) {
  await requireCaller("catalog:manage");
  await prisma.collection.create({ data: input });
  revalidatePath("/admin/collections");
}

export async function createPiece(input: {
  slug: string;
  title: string;
  editorialCopy: string;
  collectionId: string;
  imageUrl?: string;
  imageAlt?: string;
}) {
  await requireCaller("catalog:manage");

  await prisma.piece.create({
    data: {
      slug: input.slug,
      title: input.title,
      editorialCopy: input.editorialCopy,
      collectionId: input.collectionId,
      images: input.imageUrl
        ? { create: [{ url: input.imageUrl, alt: input.imageAlt ?? input.title, position: 0 }] }
        : undefined,
    },
  });

  revalidatePath("/admin/collections");
}

export async function addVariant(pieceId: string, input: { size: string; colorway: string; sku: string; price: number }) {
  await requireCaller("inventory:manage");
  await prisma.variant.create({ data: { pieceId, ...input } });
  revalidatePath("/admin/collections");
}
