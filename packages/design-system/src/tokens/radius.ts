/**
 * Radius tokens. The brand's visual language is sharp-edged (editorial
 * panels, imagery, dividers all run to 0 radius) — softness is reserved for
 * small interactive targets where a hard corner reads as unfinished, and
 * `full` is reserved for pill-shaped tags/badges only.
 */
export const radius = {
  none: "0px",
  sm: "2px", // inputs, buttons
  md: "4px", // cards, popovers
  full: "9999px", // badges/tags only
} as const;
