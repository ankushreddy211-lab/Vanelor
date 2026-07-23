/**
 * A subtle shimmer gradient, base64-encoded as an SVG data URL, for use as
 * next/image's `blurDataURL`. Used for real product photography, which —
 * unlike the Unsplash atmosphere pipeline — has no API-provided dominant
 * color to seed a blur-up placeholder from.
 */
export function shimmerPlaceholder(width = 400, height = 500): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#1B1B17" />
  <rect width="${width}" height="${height}" fill="#242420" opacity="0.6" />
</svg>`.trim();
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
