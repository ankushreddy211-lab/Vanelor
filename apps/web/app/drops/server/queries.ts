import { prisma } from "@valenor/db";
import { DropNotFoundError } from "./errors";

console.log("Current DATABASE_URL:", process.env.DATABASE_URL);

/**
 * Explicit return shapes throughout this file, rather than relying on
 * Prisma's generated types — consistent with the rest of this codebase
 * (see lib/auth/rbac.ts) and necessary in this sandbox specifically, since
 * no engine binary means no generated client. These shapes are structurally
 * correct and remain so once `prisma generate` runs for real.
 */
export interface DropPieceSummary {
  id: string;
  slug: string;
  title: string;
  images: Array<{ url: string; alt: string }>;
}

export interface DropDetail {
  id: string;
  slug: string;
  liveAt: Date;
  endsAt: Date;
  storedStatus: "SCHEDULED" | "LIVE" | "ENDED";
  collection: { title: string; slug: string };
  pieces: DropPieceSummary[];
}

export async function getDropBySlug(slug: string): Promise<DropDetail> {
  const drop = await prisma.drop.findUnique({
    where: { slug },
    include: {
      collection: true,
      dropPieces: {
        include: { piece: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
      },
    },
  });

  if (!drop) {
    throw new DropNotFoundError(slug);
  }

  return {
    id: drop.id,
    slug: drop.slug,
    liveAt: drop.liveAt,
    endsAt: drop.endsAt,
    storedStatus: drop.status,
    collection: { title: drop.collection.title, slug: drop.collection.slug },
    pieces: drop.dropPieces.map(
      (dp: {
        piece: { id: string; slug: string; title: string; images: Array<{ url: string; alt: string }> };
      }) => ({
        id: dp.piece.id,
        slug: dp.piece.slug,
        title: dp.piece.title,
        images: dp.piece.images,
      })
    ),
  };
}

export interface DropListItem {
  id: string;
  slug: string;
  liveAt: Date;
  endsAt: Date;
  storedStatus: "SCHEDULED" | "LIVE" | "ENDED";
  collectionId: string;
  collectionTitle: string;
  pieceCount: number;
}

export async function listDrops(): Promise<DropListItem[]> {
  const drops = await prisma.drop.findMany({
    orderBy: { liveAt: "desc" },
    include: { collection: true, dropPieces: true },
  });

  return drops.map((drop: any) => ({
    id: drop.id,
    slug: drop.slug,
    liveAt: drop.liveAt,
    endsAt: drop.endsAt,
    storedStatus: drop.status,
    collectionId: drop.collectionId,
    collectionTitle: drop.collection.title,
    pieceCount: drop.dropPieces.length,
  }));
}

// NEW: Add this to the bottom of the file
export async function getLatestUpcomingDrop(): Promise<DropListItem | null> {
  const drops = await listDrops();
  
  // Find the first drop that is still active or future-scheduled
  const now = new Date();
  const upcoming = drops
    .filter((d) => d.endsAt > now)
    .sort((a, b) => a.liveAt.getTime() - b.liveAt.getTime());

  return upcoming[0] || null;
}