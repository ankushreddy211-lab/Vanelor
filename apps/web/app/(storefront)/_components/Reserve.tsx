"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Eyebrow, Text } from "@valenor/design-system";

const revealUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Reserve() {
  const benefits = [
    "Early allocations",
    "Chapter announcements",
    "Archive access",
    "Private releases",
  ];

  return (
    <section id="reserve" className="border-t border-border bg-bg px-6 py-28 md:px-12 md:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="grid w-full items-center gap-12 md:grid-cols-2 md:gap-20">
          
          {/* Left Block: Informational Membership Mechanics */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={revealUp}
            className="max-w-xl"
          >
            <Eyebrow numeral="VII">The Membership</Eyebrow>
            
            <Text role="headingLg" as="h2" className="mt-6 font-serif uppercase tracking-wide">
              Membership within The House.
            </Text>
            
            <Text role="body" as="p" className="mt-6 text-fg-muted">
              Acquire standing within the house ledger. The experience values patience, consideration, and permanence over speed.
            </Text>

            {/* Premium Bullet Points Grid */}
            <div className="mt-8 border-t border-border/60 pt-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle block mb-4">
                Members receive:
              </span>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="h-[3px] w-[3px] bg-fg-subtle rounded-full flex-shrink-0" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-fg-muted">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Text role="body" as="p" className="mt-8 text-xs font-mono uppercase tracking-widest text-fg-subtle italic">
              Access sequence initialized upon acquisition.
            </Text>

            {/* Premium Micro-Action Bridge Button */}
            <div className="mt-10">
              <Link
                href="/membership/acquire"
                className="inline-flex items-center justify-center border border-border bg-transparent px-8 py-3 font-mono text-xs uppercase tracking-[0.2em] text-fg transition-all duration-300 hover:bg-fg hover:text-bg hover:border-fg"
              >
                Acquire Membership →
              </Link>
            </div>
          </motion.div>

          {/* Right Block: Structural Visual Asset Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-raised border border-border">
              <Image
                src="/FIG-7.png"
                alt="VALENOR House Membership Exclusive Invitation Art"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-opacity duration-500 hover:opacity-95"
                priority
              />
              <div className="absolute bottom-4 left-4 bg-bg/85 backdrop-blur-sm px-3 py-1 text-[10px] tracking-label uppercase text-fg-muted">
                Fig. VII — House Membership
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}