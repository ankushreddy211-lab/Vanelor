import { Text, Study } from "@valenor/design-system";
import type { DropPieceSummary } from "../server/queries";
import { PieceImage } from "../../../components/media/PieceImage";

/**
 * Phase 6's AttemptReservationButton demo is gone — Phase 7 replaced it
 * with the real flow. Pieces link into the drop context via a query param
 * (`?drop=slug`), which the Piece page reads to decide whether to show the
 * real ReservationPanel (variant + Reserve, wired to the actual hold) or
 * fall back to the cosmetic VariantSelector for out-of-drop-context views.
 */
export function DropPieceGrid({
  dropSlug,
  pieces,
  status,
}: {
  dropSlug: string;
  pieces: DropPieceSummary[];
  status: "SCHEDULED" | "LIVE" | "ENDED";
}) {
  if (pieces.length === 0) {
    return (
      <Text role="bodySm" as="p" className="text-center text-fg-muted">
        Pieces for this drop haven&apos;t been announced yet.
      </Text>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
      {pieces.map((piece) => {
        const href = status === "LIVE" ? `/pieces/${piece.slug}?drop=${dropSlug}` : `/pieces/${piece.slug}`;
        return (
          <div key={piece.id} className="flex flex-col gap-3">
            <a href={href} className="block transition-opacity hover:opacity-80" aria-label={piece.title}>
              {piece.images[0] ? (
                <PieceImage src={piece.images[0].url} alt={piece.images[0].alt} />
              ) : (
                <Study seed={piece.slug} alt={piece.title} />
              )}
            </a>
            <a href={href} className="font-body text-sm font-normal text-fg hover:text-accent-strong">
              {piece.title}
            </a>
          </div>
        );
      })}
    </div>
  );
}
