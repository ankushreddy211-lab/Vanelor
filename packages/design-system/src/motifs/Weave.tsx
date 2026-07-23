import { createRng, rangeBetween } from "./rng";

const WIDTH = 400;
const HEIGHT = 500;

/**
 * A basket-weave grain — alternating warp/weft threads with slight organic
 * variance in spacing, the way a raw undyed cloth reads up close. Stands
 * in for material photography on the "fibre chosen the way a jeweller
 * chooses stone" chapter.
 */
export function Weave({ seed, className }: { seed: string; className?: string }) {
  const rng = createRng(seed);
  const spacing = 15;
  const cols = Math.ceil(WIDTH / spacing) + 1;
  const rows = Math.ceil(HEIGHT / spacing) + 1;

  const verticals = Array.from({ length: cols }, (_, i) => {
    const jitter = rangeBetween(rng, -1.2, 1.2);
    return i * spacing + jitter;
  });
  const horizontals = Array.from({ length: rows }, (_, i) => {
    const jitter = rangeBetween(rng, -1.2, 1.2);
    return i * spacing + jitter;
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="var(--color-bg-raised)" />
      {/* weft: horizontal threads broken into dashes that alternate which
          verticals they pass "over", giving a basket-weave read */}
      {horizontals.map((y, rowIndex) => (
        <g key={`row-${rowIndex}`}>
          {verticals.slice(0, -1).map((x, colIndex) => {
            const over = (rowIndex + colIndex) % 2 === 0;
            const nextX = verticals[colIndex + 1] ?? x + spacing;
            return (
              <line
                key={`seg-${rowIndex}-${colIndex}`}
                x1={x}
                y1={y}
                x2={nextX}
                y2={y}
                stroke="var(--color-fg-subtle)"
                strokeWidth={over ? 1.1 : 0.5}
                opacity={over ? 0.42 : 0.22}
              />
            );
          })}
        </g>
      ))}
      {/* warp: vertical threads, same over/under alternation, offset so it
          reads as interleaved rather than a plain grid */}
      {verticals.map((x, colIndex) => (
        <g key={`col-${colIndex}`}>
          {horizontals.slice(0, -1).map((y, rowIndex) => {
            const over = (rowIndex + colIndex) % 2 === 1;
            const nextY = horizontals[rowIndex + 1] ?? y + spacing;
            return (
              <line
                key={`vseg-${colIndex}-${rowIndex}`}
                x1={x}
                y1={y}
                x2={x}
                y2={nextY}
                stroke="var(--color-fg-subtle)"
                strokeWidth={over ? 1.1 : 0.5}
                opacity={over ? 0.42 : 0.22}
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}
