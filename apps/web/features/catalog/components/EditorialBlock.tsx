import Image from "next/image";
import { Text } from "@valenor/design-system";
import type { PieceEditorialBlockData } from "../server/queries";

/**
 * Content is stored as JSON (schema.prisma's PieceEditorialBlock.content),
 * shape depends on `type`. This function is the one place that interprets
 * that JSON — matches architecture §13: "structured, block-based, not
 * free-form HTML, so an editor can't accidentally break the design
 * system's typography/spacing tokens." Unknown/malformed content renders
 * nothing rather than throwing — editorial content shouldn't be able to
 * 500 a product page.
 */
export function EditorialBlock({ block }: { block: PieceEditorialBlockData }) {
  const content = block.content as Record<string, unknown>;

  switch (block.type) {
    case "RICH_TEXT": {
      const text = typeof content.text === "string" ? content.text : null;
      if (!text) return null;
      return (
        <Text role="body" as="p" className="mx-auto max-w-2xl text-fg-muted">
          {text}
        </Text>
      );
    }

    case "QUOTE": {
      const text = typeof content.text === "string" ? content.text : null;
      if (!text) return null;
      const attribution = typeof content.attribution === "string" ? content.attribution : null;
      return (
        <blockquote className="mx-auto max-w-xl text-center">
          <Text role="headingSm" as="p" className="font-display italic text-fg">
            &ldquo;{text}&rdquo;
          </Text>
          {attribution && (
            <Text role="caption" as="cite" className="mt-4 block not-italic">
              — {attribution}
            </Text>
          )}
        </blockquote>
      );
    }

    case "IMAGE": {
      const url = typeof content.url === "string" ? content.url : null;
      if (!url) return null;
      const alt = typeof content.alt === "string" ? content.alt : "";
      // Editors can supply real dimensions for accurate aspect ratio; if
      // omitted, default to a 4:5 portrait — matches the rest of the
      // catalog's frame rather than guessing a landscape ratio.
      const width = typeof content.width === "number" ? content.width : 1600;
      const height = typeof content.height === "number" ? content.height : 2000;
      return (
        <figure>
          <Image
            src={url}
            alt={alt}
            width={width}
            height={height}
            sizes="(min-width: 768px) 700px, 100vw"
            className="w-full border border-border"
            style={{ height: "auto" }}
          />
          {typeof content.caption === "string" && (
            <Text role="caption" as="figcaption" className="mt-3 text-center">
              {content.caption}
            </Text>
          )}
        </figure>
      );
    }

    case "GALLERY": {
      const images = Array.isArray(content.images) ? content.images : [];
      return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((image, i) => {
            const url = typeof image === "object" && image && "url" in image ? String(image.url) : null;
            if (!url) return null;
            const alt =
              typeof image === "object" && image && "alt" in image && typeof image.alt === "string"
                ? image.alt
                : "";
            return (
              <div key={i} className="relative aspect-square w-full overflow-hidden border border-border">
                <Image src={url} alt={alt} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
              </div>
            );
          })}
        </div>
      );
    }

    // HERO and PRODUCT_REFERENCE are primarily used on CmsPage (Phase 8
    // CMS build-out), not on a Piece's own editorial blocks — left
    // unhandled here deliberately rather than guessing a rendering for a
    // use case that doesn't exist on this page type yet.
    default:
      return null;
  }
}
