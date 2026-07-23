/**
 * Deterministic PRNG, seeded from a string (a piece slug, chapter numeral,
 * collection id — anything stable). Two callers with the same seed always
 * get the same motif. This matters here specifically: a piece's generative
 * art should stay constant across requests/deploys, the same way a real
 * product photo would, rather than reshuffling on every page load.
 *
 * mulberry32, seeded via a small string hash (djb2 variant). Not
 * cryptographic — doesn't need to be, it's picking line angles, not keys.
 */
export function createRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;
  return function next() {
    state = Math.imul(state ^ (state >>> 16), 2246822507);
    state = Math.imul(state ^ (state >>> 13), 3266489909);
    state ^= state >>> 16;
    return (state >>> 0) / 4294967296;
  };
}

/** Maps a seed to one of the four motif variants, evenly and stably. */
export function variantForSeed(seed: string): "contour" | "weave" | "drape" | "seam" {
  const variants = ["contour", "weave", "drape", "seam"] as const;
  const rng = createRng(seed);
  return variants[Math.floor(rng() * variants.length)] ?? variants[0];
}

export function rangeBetween(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}
