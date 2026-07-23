/**
 * Motion tokens. "Motion is a design element" per the brand brief — but an
 * orchestrated moment lands harder than scattered effects, so this file
 * intentionally exposes few durations/easings and a small set of named
 * recipes, rather than letting every component invent its own timing.
 *
 * All consumers must also honor `prefers-reduced-motion` — see
 * `accessibility.ts` for the reduced-motion override contract.
 */

export const duration = {
  instant: 100,
  fast: 200,
  base: 350,
  slow: 600,
  cinematic: 900,
  reveal: 1200,
} as const;

export const easing = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  entrance: "cubic-bezier(0.22, 1, 0.36, 1)",
  // The house easing — used for the Seam, hero reveal, and any moment that
  // should feel like a thread being pulled taut rather than a UI sliding in.
  seam: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

export interface MotionRecipe {
  durationMs: number;
  easing: string;
  description: string;
}

export const motionRecipe: Record<string, MotionRecipe> = {
  fadeUp: {
    durationMs: duration.base,
    easing: easing.entrance,
    description: "Default scroll-reveal for editorial content blocks.",
  },
  cinematicReveal: {
    durationMs: duration.reveal,
    easing: easing.entrance,
    description: "Hero wordmark / landing-moment reveals only — use sparingly.",
  },
  microInteraction: {
    durationMs: duration.fast,
    easing: easing.standard,
    description: "Hover/focus state changes on interactive primitives.",
  },
};
