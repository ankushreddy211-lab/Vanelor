import type { Config } from "tailwindcss";

// Consumes the semantic CSS custom properties defined in src/css/tokens.css,
// never raw hex values — this file should never need to change when the
// palette changes, only tokens.css / tokens/color.ts do.
//
// Note: spacing is intentionally NOT extended here. Tailwind's default
// spacing scale (4px base, e.g. `32` = 128px, `40` = 160px) already matches
// tokens/spacing.ts exactly by design — see README. Consumers use standard
// Tailwind spacing utilities as the design tokens.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
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
      boxShadow: {
        sm: "0 1px 2px rgba(10, 10, 8, 0.4)",
        md: "0 8px 24px rgba(10, 10, 8, 0.45)",
      },
    },
  },
  plugins: [],
} satisfies Config;
