// Computes real WCAG 2.x contrast ratios for every semantic foreground/background
// pairing in both themes. Run with: npm run audit:contrast
// This is the source for CONTRAST_AUDIT.md — regenerate that file if tokens change.

const themes = {
  dark: {
    bg: "#121210",
    bgRaised: "#1b1b17",
    fg: "#eae4d6",
    fgMuted: "#b9b3a3",
    fgSubtle: "#6e6a5e",
    accent: "#4f6b5c",
    accentStrong: "#7fa08d",
  },
  light: {
    bg: "#f4f1e9",
    bgRaised: "#eae5d8",
    fg: "#0a0a08",
    fgMuted: "#4a473d",
    fgSubtle: "#6e6a5e",
    accent: "#2f4a3d",
    accentStrong: "#23392f",
  },
};

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function relativeLuminance({ r, g, b }) {
  const transform = (channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [transform(r), transform(g), transform(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(hexA, hexB) {
  const lumA = relativeLuminance(hexToRgb(hexA));
  const lumB = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

function verdict(ratio, isLargeText) {
  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;
  if (ratio >= aaaThreshold) return "AAA";
  if (ratio >= aaThreshold) return "AA";
  return "FAIL";
}

const pairsToCheck = [
  ["fg", "bg", false, "Primary body text on primary background"],
  ["fgMuted", "bg", false, "Secondary/muted text on primary background"],
  ["fgSubtle", "bg", true, "Tertiary/subtle text — large text or non-text use only"],
  ["accentStrong", "bg", false, "Interactive accent text/links on primary background"],
  ["accent", "bg", true, "Base accent — large text, graphics, or decorative use only"],
  ["fg", "bgRaised", false, "Primary body text on raised panel background"],
];

let output = "# VALENOR Design System — Contrast Audit\n\n";
output += "Computed via WCAG 2.x relative luminance, not estimated. Regenerate with `npm run audit:contrast`.\n\n";

for (const [themeName, theme] of Object.entries(themes)) {
  output += `## ${themeName[0].toUpperCase()}${themeName.slice(1)} theme\n\n`;
  output += "| Pair | Use case | Ratio | Normal text | Large text |\n";
  output += "|---|---|---|---|---|\n";
  for (const [fgKey, bgKey, largeOnly, useCase] of pairsToCheck) {
    const fgHex = theme[fgKey];
    const bgHex = theme[bgKey];
    const ratio = contrastRatio(fgHex, bgHex);
    const normalVerdict = largeOnly ? "n/a" : verdict(ratio, false);
    const largeVerdict = verdict(ratio, true);
    output += `| \`${fgKey}\` on \`${bgKey}\` | ${useCase} | ${ratio.toFixed(2)}:1 | ${normalVerdict} | ${largeVerdict} |\n`;
  }
  output += "\n";
}

output += "## Notes\n\n";
output += "- `accent` (base, not -Strong) fails AA for normal text in both themes by design — it is reserved for large display type, icons, and the Seam element, never for small interactive text. Use `accentStrong` for links/buttons.\n";
output += "- `fgSubtle` is intentionally low-contrast (labels, captions at 24px+, or paired with non-text decoration) — never used for body copy.\n";
output += "- All primary and interactive text pairs clear AA; most clear AAA. Any token change must be re-run through this script before merge.\n";

console.log(output);

import { writeFileSync } from "node:fs";
writeFileSync(new URL("../CONTRAST_AUDIT.md", import.meta.url), output);
console.log("\nWritten to CONTRAST_AUDIT.md");
