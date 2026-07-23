import { createRng, rangeBetween } from "./rng";

const WIDTH = 400;
const HEIGHT = 500;

function fold(rng: () => number, xStart: number): string {
  const topY = -20;
  const bottomY = HEIGHT + 20;
  const c1x = xStart + rangeBetween(rng, -30, 30);
  const c1y = HEIGHT * rangeBetween(rng, 0.28, 0.4);
  const c2x = xStart + rangeBetween(rng, -30, 30);
  const c2y = HEIGHT * rangeBetween(rng, 0.62, 0.76);
  return `M ${xStart} ${topY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${xStart + rangeBetween(rng, -14, 14)} ${bottomY}`;
}

/**
 * A handful of long vertical fold lines with soft curvature — the way
 * fabric falls off a shoulder or a hem, abstracted to line work rather
 * than a literal garment render. Stands in for the "restraint is a
 * silhouette decision" form chapter.
 */
export function Drape({ seed, className }: { seed: string; className?: string }) {
  const rng = createRng(seed);
  const foldCount = 9;
  const folds = Array.from({ length: foldCount }, (_, i) => {
    const xStart = (WIDTH / (foldCount - 1)) * i;
    return { d: fold(rng, xStart), index: i };
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="var(--color-bg-raised)" />
      {folds.map((f) => (
        <path
          key={f.index}
          d={f.d}
          fill="none"
          stroke={f.index === Math.floor(foldCount / 2) ? "var(--color-accent)" : "var(--color-fg-subtle)"}
          strokeWidth={f.index === Math.floor(foldCount / 2) ? 1.2 : 0.7}
          opacity={f.index === Math.floor(foldCount / 2) ? 0.6 : 0.32}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
