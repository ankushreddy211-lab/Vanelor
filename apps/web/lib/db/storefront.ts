import { prisma } from "@/lib/prisma"; // Adjust this based on your root client configuration mapping

export interface LiveProductSpecimen {
  slug: string;
  name: string;
  textile: string;
  allocationValuation: number;
  imageUrl: string;
}

export interface LiveChapterRelease {
  title: string;
  subtitle: string;
  windowCloses: string;
  pieces: LiveProductSpecimen[];
}

/**
 * Fetches the active system allocation configuration matrix from the live Prisma database engine.
 * Falls back to null dynamically if no collection window is currently set active by administration.
 */
export async function getActiveCollectionMatrix(): Promise<LiveChapterRelease | null> {
  try {
    const activeChapter = await prisma.chapter.findFirst({
      where: { status: "ACTIVE" },
      include: {
        products: {
          select: {
            slug: true,
            name: true,
            material: true,
            price: true,
            images: { select: { url: true }, take: 1 }
          }
        }
      }
    });

    if (!activeChapter) return null;

    // Calculate window remaining text parameters dynamically based on database date markers
    const targetDate = new Date(activeChapter.windowCloseDate);
    const now = new Date();
    const diffHours = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
    const windowClosesString = diffHours > 48 
      ? \ Days Remaining 
      : \ Hours Remaining;

    return {
      title: activeChapter.title, // e.g., "Chapter IV"
      subtitle: \ Pieces Architecture,
      windowCloses: windowClosesString,
      pieces: activeChapter.products.map((p) => ({
        slug: p.slug,
        name: p.name,
        textile: p.material,
        allocationValuation: p.price,
        imageUrl: p.images[0]?.url || "/placeholder.png"
      }))
    };
  } catch (error) {
    console.error("Ledger Engine Fetch Failure:", error);
    return null;
  }
}
