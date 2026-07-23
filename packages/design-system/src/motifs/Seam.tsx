import { createRng, rangeBetween } from "./rng";

const WIDTH = 400;
const HEIGHT = 500;

/**
 * A seam line with visible stitch marks, plus a small cluster of button
 * studies — the vocabulary of a tailor's spec sheet rather than a photo.
 * Used as the fourth motif in the rotation, mostly for individual pieces
 * (a spec-card reads naturally at product scale).
 */
export function Seam({ seed, className }: { seed: string; className?: string }) {
  const rng = createRng(seed);

  const c1x = rangeBetween(rng, 60, 160);
  const c1y = rangeBetween(rng, 120, 200);
  const c2x = rangeBetween(rng, 220, 340);
  const c2y = rangeBetween(rng, 280, 360);
  const seamPath = `M 40 60 C ${c1x} ${c1y}, ${c2x} ${c2y}, 360 440`;

  const stitchCount = 22;
  const stitches = Array.from({ length: stitchCount }, (_, i) => {
    const t = i / (stitchCount - 1);
    // approximate point on the cubic bezier at parameter t
    const x =
      Math.pow(1 - t, 3) * 40 +
      3 * Math.pow(1 - t, 2) * t * c1x +
      3 * (1 - t) * t * t * c2x +
      Math.pow(t, 3) * 360;
    const y =
      Math.pow(1 - t, 3) * 60 +
      3 * Math.pow(1 - t, 2) * t * c1y +
      3 * (1 - t) * t * t * c2y +
      Math.pow(t, 3) * 440;
    return { x, y, index: i };
  });

  const buttons = Array.from({ length: 3 }, (_, i) => ({
    cx: rangeBetween(rng, 260, 330),
    cy: 90 + i * 46,
    r: 6.5,
  }));

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="var(--color-bg-raised)" />
      <path d={seamPath} fill="none" stroke="var(--color-fg-subtle)" strokeWidth={0.6} opacity={0.4} />
      {stitches.map((s) => (
        <line
          key={s.index}
          x1={s.x - 3}
          y1={s.y - 3}
          x2={s.x + 3}
          y2={s.y + 3}
          stroke="var(--color-accent)"
          strokeWidth={1}
          opacity={0.55}
        />
      ))}
      {buttons.map((b, i) => (
        <g key={i}>
          <circle cx={b.cx} cy={b.cy} r={b.r} fill="none" stroke="var(--color-fg-subtle)" strokeWidth={0.7} opacity={0.5} />
          <circle cx={b.cx - 2} cy={b.cy - 2} r={0.8} fill="var(--color-fg-subtle)" opacity={0.5} />
          <circle cx={b.cx + 2} cy={b.cy - 2} r={0.8} fill="var(--color-fg-subtle)" opacity={0.5} />
          <circle cx={b.cx - 2} cy={b.cy + 2} r={0.8} fill="var(--color-fg-subtle)" opacity={0.5} />
          <circle cx={b.cx + 2} cy={b.cy + 2} r={0.8} fill="var(--color-fg-subtle)" opacity={0.5} />
        </g>
      ))}
    </svg>
  );
}
