import { createRng, rangeBetween } from "./rng";

const WIDTH = 400;
const HEIGHT = 500;

function contourPath(rng: () => number, baseY: number, amplitude: number): string {
  const points: [number, number][] = [];
  const segments = 7;
  const freq1 = rangeBetween(rng, 1.4, 2.4);
  const freq2 = rangeBetween(rng, 2.6, 4.2);
  const phase = rangeBetween(rng, 0, Math.PI * 2);

  for (let i = 0; i <= segments; i++) {
    const x = (WIDTH / segments) * i;
    const t = (i / segments) * Math.PI * 2;
    const y =
      baseY +
      Math.sin(t * freq1 + phase) * amplitude +
      Math.sin(t * freq2 + phase * 1.7) * (amplitude * 0.35);
    points.push([x, y]);
  }

  const first = points[0]!;
  let d = `M ${first[0]} ${first[1]}`;
  for (let i = 1; i < points.length; i++) {
    const [px, py] = points[i - 1]!;
    const [cx, cy] = points[i]!;
    const midX = (px + cx) / 2;
    d += ` Q ${midX} ${py} ${cx} ${cy}`;
  }
  return d;
}

/**
 * A field of elevation-style contour lines, loosely reading as a valley
 * seen in section — the "made where the mountains keep time" origin
 * chapter's visual counterpart. Rendered as fine strokes only (no fill),
 * matching a surveyor's plate rather than a landscape illustration.
 */
export function Contour({
  seed,
  className,
  filled = true,
}: {
  seed: string;
  className?: string;
  /** Set false to omit the background rect — for use as a transparent overlay layer rather than inside a bordered Study card. */
  filled?: boolean;
}) {
  const rng = createRng(seed);
  const lineCount = 11;
  const lines = Array.from({ length: lineCount }, (_, i) => {
    const baseY = (HEIGHT / (lineCount - 1)) * i;
    const amplitude = rangeBetween(rng, 14, 46) * (1 - Math.abs(i / (lineCount - 1) - 0.5));
    return { d: contourPath(rng, baseY, amplitude + 8), index: i };
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      {filled && <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="var(--color-bg-raised)" />}
      {lines.map((line) => (
        <path
          key={line.index}
          d={line.d}
          fill="none"
          stroke={line.index % 5 === 2 ? "var(--color-accent)" : "var(--color-fg-subtle)"}
          strokeWidth={line.index % 5 === 2 ? 1.1 : 0.6}
          opacity={line.index % 5 === 2 ? 0.55 : 0.4}
        />
      ))}
    </svg>
  );
}
