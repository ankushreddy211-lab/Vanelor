import { env } from "../env";

export interface AtmosphereImage {
  url: string;
  width: number;
  height: number;
  alt: string;
  /** Unsplash API guidelines require visible photographer + Unsplash attribution wherever the image is used. */
  credit: { photographerName: string; photographerUrl: string; unsplashUrl: string };
  blurDataURL: string;
}

interface UnsplashPhoto {
  urls: { regular: string };
  width: number;
  height: number;
  alt_description: string | null;
  color: string | null;
  user: { name: string; links: { html: string } };
  links: { html: string };
}

const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";

/**
 * Fetches one licensed atmosphere/texture photo for a search query (e.g.
 * "raw wool textile", "tailoring workshop fabric"). Deliberately narrow:
 * this is for mood/material photography, never for "a model wearing a
 * VALENOR piece" — that photography doesn't exist and this function has
 * no way to produce it.
 *
 * Never throws. A missing API key, network failure, or empty result set
 * all resolve to `null` so callers can fall back to the generative motif
 * system (@valenor/design-system/motifs) without a broken surface.
 *
 * Revalidated daily — atmosphere photography for a given query doesn't
 * need to be fetched on every request, and Unsplash's rate limits are
 * tight on the free tier.
 */
export async function getAtmosphereImage(query: string): Promise<AtmosphereImage | null> {
  if (!env.UNSPLASH_ACCESS_KEY) return null;

  try {
    const url = new URL(UNSPLASH_SEARCH_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", "portrait");
    url.searchParams.set("content_filter", "high");

    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}` },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { results: UnsplashPhoto[] };
    const photo = data.results[0];
    if (!photo) return null;

    return {
      url: photo.urls.regular,
      width: photo.width,
      height: photo.height,
      alt: photo.alt_description ?? query,
      credit: {
        photographerName: photo.user.name,
        photographerUrl: `${photo.user.links.html}?utm_source=valenor&utm_medium=referral`,
        unsplashUrl: `${photo.links.html}?utm_source=valenor&utm_medium=referral`,
      },
      blurDataURL: solidColorPlaceholder(photo.color ?? "#1B1B17"),
    };
  } catch {
    // Atmosphere photography is an enhancement, never a hard dependency —
    // any failure here should degrade silently, not surface to the user.
    return null;
  }
}

function solidColorPlaceholder(hex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="10"><rect width="8" height="10" fill="${hex}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
