import Image from "next/image";
import { shimmerPlaceholder } from "../../lib/images/placeholder";

/**
 * Renders a piece's real product photograph inside the same aspect-[4/5]
 * bordered frame the generative Study card uses — so the frame stays
 * identical whether a piece has a photo yet or not, and swapping one for
 * the other (once a shoot happens) is a data change, not a layout change.
 *
 * `alt` is required, not optional — a product image with no alt text is
 * an accessibility regression, not a style choice.
 */
export function PieceImage({
  src,
  alt,
  sizes = "(min-width: 768px) 33vw, 50vw",
  priority = false,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-bg-raised">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={shimmerPlaceholder()}
        className="object-cover"
      />
    </div>
  );
}
