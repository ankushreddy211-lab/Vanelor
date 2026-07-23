/**
 * Grid and responsive tokens. Breakpoints match Tailwind's defaults
 * deliberately (boring choice, per architecture doc §2 — "timeless, not
 * trend-driven" applies to infrastructure conventions too, not just visuals)
 * so there's no parallel breakpoint system to keep in sync.
 */
export const breakpoint = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const grid = {
  columns: 12,
  containerMaxWidth: "1280px",
  gutter: {
    base: "24px", // mobile
    md: "32px", // tablet
    lg: "48px", // desktop — editorial layouts need room to breathe
  },
  marginInline: {
    base: "24px",
    md: "48px",
  },
} as const;
