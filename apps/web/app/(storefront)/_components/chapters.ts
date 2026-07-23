import type { MotifVariant } from "@valenor/design-system";

export interface Chapter {
  numeral: string;
  eyebrow: string;
  title: string;
  body: string;
  align: "left" | "right";
  imageAlt: string;
  motifVariant: MotifVariant;
  motifSeed: string;
  atmosphereQuery: string;
  previewUrl?: string;
}

export const chapters: Chapter[] = [
  {
    numeral: "I",
    eyebrow: "Origin",
    title: "Made where the mountains keep time",
    body: "VALENOR begins in Himalaya's Valley, not as a reaction to fast fashion, but as a refusal of it. Every piece is considered before it is cut. Nothing leaves the house until it has earned the right to.",
    align: "left",
    imageAlt: "Topographic survey visual framework capturing the Himalaya Valley landscape baseline structure.",
    motifVariant: "contour",
    motifSeed: "chapter-origin",
    atmosphereQuery: "himalaya mountain valley stone texture",
    previewUrl: "/FIG-1.png"
  },
  {
    numeral: "II",
    eyebrow: "Material",
    title: "Fibre chosen the way a jeweller chooses stone",
    body: "Undyed wool. Hand-finished cotton. Nothing synthetic, nothing shouted about. The material is the argument — we simply get out of its way.",
    align: "right",
    imageAlt: "Detailed weave structural close-up showcasing undyed luxury cotton composition.",
    motifVariant: "weave",
    motifSeed: "chapter-material",
    atmosphereQuery: "raw undyed wool cotton fabric texture",
    previewUrl: "/FIG-2.png"
  },
  {
    numeral: "III",
    eyebrow: "Form",
    title: "Restraint is a silhouette decision",
    body: "No logo defines a garment. Proportion does. Every line, every seam, and every angle is refined until the piece speaks through its shape rather than decoration. Quiet confidence is engineered into the silhouette before it is ever worn.",
    align: "left",
    imageAlt: "Tailored geometry design lines focusing on posture and silhouette composition.",
    motifVariant: "drape",
    motifSeed: "chapter-form",
    atmosphereQuery: "editorial high fashion silhouette architecture shadow",
    previewUrl: "/FIG-3.png"
  },
  {
    numeral: "IV",
    eyebrow: "Craftsmanship",
    title: "Built one detail at a time",
    body: "Every stitch serves a purpose. Every button, seam, and edge is examined repeatedly before becoming part of the final garment. Craftsmanship is not decoration—it is discipline made visible.",
    align: "right",
    imageAlt: "Artisan stitching close-up showing human execution within an upscale studio workspace.",
    motifVariant: "seam",
    motifSeed: "chapter-craft",
    atmosphereQuery: "tailoring atelier artisan hand sewing thread detail moody close up",
    previewUrl: "/FIG-4.png"
  },
  {
    numeral: "V",
    eyebrow: "Details",
    title: "Luxury lives in what most never notice",
    body: "The weight of a button. The roll of a collar. The texture of wool beneath natural light. These details rarely demand attention, yet together they define how a garment feels for years to come.",
    align: "left",
    imageAlt: "Extreme macro camera work isolating raw premium button material capture.",
    motifVariant: "weave",
    motifSeed: "chapter-details",
    atmosphereQuery: "luxury fabric texture macro natural light horn button",
    previewUrl: "/FIG-5.png"
  }
];