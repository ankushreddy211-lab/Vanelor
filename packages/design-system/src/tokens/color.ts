/**
 * Color tokens.
 *
 * Two layers, deliberately kept separate:
 *  - `primitive` colors are raw values, named for what they ARE (material
 *    references, per brand DNA — ink, bone, patina).
 *  - `semantic` tokens are named for what they DO (bg, fg, accent, border),
 *    and are the only thing components should ever reference. This is what
 *    makes dark/light theming and future re-palettes a token edit, not a
 *    component-by-component rewrite.
 *
 * Source of truth for both Tailwind config and the generated CSS custom
 * properties in `../css/tokens.css` — keep them in sync manually until a
 * build step generates one from the other (flagged as a Phase 3 nice-to-have).
 */

export const primitiveColor = {
  ink: {
    950: "#0A0A08",
    900: "#121210",
    800: "#1B1B17",
  },
  bone: {
    100: "#F4F1E9",
    200: "#EAE5D8",
    300: "#EAE4D6",
    500: "#B9B3A3",
  },
  slate: {
    500: "#6E6A5E",
    700: "#4A473D",
    800: "#333025",
  },
  patina: {
    400: "#7FA08D",
    500: "#4F6B5C",
    700: "#2F4A3D",
    800: "#23392F",
  },
} as const;

export type ThemeName = "dark" | "light";

export interface SemanticColorTokens {
  bg: string;
  bgRaised: string;
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  accent: string;
  accentStrong: string;
  border: string;
  focusRing: string;
}

export const semanticColor: Record<ThemeName, SemanticColorTokens> = {
  // Dark is the brand's home theme — the storefront/editorial experience.
  dark: {
    bg: primitiveColor.ink[900],
    bgRaised: primitiveColor.ink[800],
    fg: primitiveColor.bone[300],
    fgMuted: primitiveColor.bone[500],
    fgSubtle: primitiveColor.slate[500],
    accent: primitiveColor.patina[500],
    accentStrong: primitiveColor.patina[400],
    border: "rgba(234, 228, 214, 0.12)",
    focusRing: primitiveColor.patina[400],
  },
  // Light is used for admin/ops tooling (architecture §13) and any
  // print/email-adjacent surface where a dark canvas doesn't serve the
  // content — same material language, inverted.
  light: {
    bg: primitiveColor.bone[100],
    bgRaised: primitiveColor.bone[200],
    fg: primitiveColor.ink[950],
    fgMuted: primitiveColor.slate[700],
    fgSubtle: primitiveColor.slate[500],
    accent: primitiveColor.patina[700],
    accentStrong: primitiveColor.patina[800],
    border: "rgba(23, 23, 15, 0.14)",
    focusRing: primitiveColor.patina[700],
  },
};
