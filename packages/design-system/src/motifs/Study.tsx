import { cn } from "../lib/cn";
import { Contour } from "./Contour";
import { Weave } from "./Weave";
import { Drape } from "./Drape";
import { Seam } from "./Seam";
import { variantForSeed } from "./rng";

export type MotifVariant = "contour" | "weave" | "drape" | "seam";

const MOTIF_BY_VARIANT: Record<MotifVariant, typeof Contour> = {
  contour: Contour,
  weave: Weave,
  drape: Drape,
  seam: Seam,
};

/**
 * The one place a "no photography yet" surface should reach for. Renders a
 * bordered specimen card — same frame a real product photo would sit in —
 * filled with a deterministic generative motif instead of a gradient.
 *
 * `seed` should be something stable per-subject (a piece slug, a chapter
 * numeral) so the same subject always renders the same study. `variant`
 * can be passed explicitly (chapters pick one to match their copy) or
 * left out to auto-rotate based on the seed (product grids, so pieces
 * don't all look identical).
 */
export function Study({
  seed,
  variant,
  numeral,
  label,
  alt,
  className,
}: {
  seed: string;
  variant?: MotifVariant;
  numeral?: string;
  label?: string;
  alt: string;
  className?: string;
}) {
  const resolvedVariant = variant ?? variantForSeed(seed);
  const Motif = MOTIF_BY_VARIANT[resolvedVariant];

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative aspect-[4/5] w-full overflow-hidden border border-border bg-bg-raised",
        className,
      )}
    >
      <Motif seed={seed} className="absolute inset-0 h-full w-full" />
      {(numeral || label) && (
        <div className="absolute bottom-4 left-4 flex items-baseline gap-2">
          {numeral && (
            <span className="font-mono text-[10px] tracking-[0.2em] text-fg-subtle">{numeral}</span>
          )}
          {label && (
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
