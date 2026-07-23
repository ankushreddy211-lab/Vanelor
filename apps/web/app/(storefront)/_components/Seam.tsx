"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@valenor/design-system";

/**
 * VALENOR's signature element. A stitched thread runs the height of the
 * page, drawn taut as the visitor scrolls, as if a needle is pulling it
 * through each chapter. Ties off near the reservation CTA. Grounded in the
 * brand's own craftsmanship vocabulary rather than a decorative progress
 * bar.
 *
 * Hidden below `sm` and rendered as a static, non-animated line when
 * reduced motion is preferred.
 */
export function Seam() {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    restDelta: 0.001,
  });
  const markerTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const knotOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 left-6 z-40 hidden items-center sm:flex md:left-10"
    >
      <div className="relative h-[72vh] w-px bg-border">
        {reducedMotion ? (
          <div className="absolute inset-0 w-px bg-accent-strong/50" />
        ) : (
          <>
            <motion.div
              className="absolute inset-x-0 top-0 w-px origin-top bg-accent-strong"
              style={{ scaleY }}
            />
            <motion.div
              className="absolute -left-[3px] h-[7px] w-[7px] rounded-full bg-accent-strong shadow-[0_0_8px_rgba(127,160,141,0.6)]"
              style={{ top: markerTop }}
            />
            <motion.span
              className="label absolute -bottom-8 -left-3 whitespace-nowrap text-accent-strong"
              style={{ opacity: knotOpacity }}
            >
              — tied
            </motion.span>
          </>
        )}
      </div>
    </div>
  );
}
