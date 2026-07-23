import type { Config } from "tailwindcss";

// Mirrors packages/design-system/tailwind.config.ts — see that package's
// README for why this isn't auto-shared yet (manual sync, flagged as a
// Phase 3+ nice-to-have). Content globs additionally scan the design
// system's source so its component classes aren't purged.
export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/design-system/src/**/*.{ts,tsx}",
  ],
  theme: {
    colors: {
      bg: "var(--color-bg)",
      "bg-raised": "var(--color-bg-raised)",
      fg: "var(--color-fg)",
      "fg-muted": "var(--color-fg-muted)",
      "fg-subtle": "var(--color-fg-subtle)",
      accent: "var(--color-accent)",
      "accent-strong": "var(--color-accent-strong)",
      border: "var(--color-border)",
      "focus-ring": "var(--color-focus-ring)",
      transparent: "transparent",
      current: "currentColor",
    },
    borderRadius: {
      none: "0px",
    },
    transitionTimingFunction: {
      seam: "var(--valenor-ease)",
    },
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
      },
      letterSpacing: {
        label: "0.22em",
      },
    },
  },
  plugins: [],
} satisfies Config;
