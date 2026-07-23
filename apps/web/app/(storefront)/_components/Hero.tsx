"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useReducedMotion, Contour } from "@valenor/design-system";

const WORDMARK = "VALENOR";

export function Hero() {
  const reducedMotion = useReducedMotion();

  const letterVariants = {
    hidden: { y: "110%" },
    visible: (i: number) => ({
      y: "0%",
      transition: {
        delay: reducedMotion ? 0 : 0.5 + i * 0.06,
        duration: reducedMotion ? 0.01 : 0.9,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4 }}
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      >
        <Contour seed="hero-valley" filled={false} className="h-full w-full" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 1 }}
        className="label mb-6"
      >
        Est. Himalayas — Timeless Premium Menswear
      </motion.p>

      <h1 className="flex overflow-hidden font-display text-[15vw] font-normal leading-none tracking-tight text-fg sm:text-[11vw] md:text-[9vw]">
        {WORDMARK.split("").map((letter, i) => (
          <span key={`${letter}-${i}`} className="overflow-hidden">
            <motion.span
              custom={i}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className="inline-block"
            >
              {letter}
            </motion.span>
          </span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reducedMotion ? 0 : 1.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 max-w-md font-display text-xl italic text-fg-muted"
      >
        Timeless, by design.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reducedMotion ? 0 : 2.1, duration: 1 }}
        className="absolute bottom-10 flex flex-col items-center gap-6"
      >
        

        <div className="flex flex-col items-center gap-3">
          <span className="label">Scroll</span>
          <motion.span
            className="h-10 w-px bg-border"
            animate={reducedMotion ? undefined : { scaleY: [0.3, 1, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "top" }}
          />
        </div>
      </motion.div>
    </section>
  );
}