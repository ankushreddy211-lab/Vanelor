import Image from "next/image";
import type { AtmosphereImage } from "../../lib/images/atmosphere";

/**
 * Real, licensed atmosphere/texture photography (fabric, tailoring tools,
 * material studies) sourced via Unsplash — used where a chapter has no
 * VALENOR photoshoot to draw on. Attribution to the photographer and
 * Unsplash is mandatory per Unsplash's API guidelines and is rendered
 * visibly, styled like the generative Study card's numeral/label caption
 * so the two visual systems read as one language rather than a photo
 * bolted onto an illustration system.
 */
export function AtmospherePhoto({
  image,
  numeral,
  label,
}: {
  image: AtmosphereImage;
  numeral?: string;
  label?: string;
}) {
  return (
    <figure className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-bg-raised">
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        placeholder="blur"
        blurDataURL={image.blurDataURL}
        className="object-cover"
      />
      <figcaption className="absolute inset-x-4 bottom-4 flex items-baseline justify-between gap-2">
        <span className="flex items-baseline gap-2">
          {numeral && (
            <span className="font-mono text-[10px] tracking-[0.2em] text-fg-subtle">{numeral}</span>
          )}
          {label && (
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
              {label}
            </span>
          )}
        </span>
        <a
          href={image.credit.photographerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[9px] uppercase tracking-[0.15em] text-fg-subtle underline decoration-border underline-offset-2 hover:text-fg-muted"
        >
          Photo: {image.credit.photographerName} / Unsplash
        </a>
      </figcaption>
    </figure>
  );
}
