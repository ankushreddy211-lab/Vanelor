"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eyebrow, Text, Button } from "@valenor/design-system";

// Helper remains consistent with §11.2 time-check requirements
function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Drop({ liveAt, slug, title }: { liveAt: string, slug: string, title: string }) {
  // Initialize state based on the server-provided liveAt timestamp
  const targetDate = new Date(liveAt).getTime();
  const [remaining, setRemaining] = useState(() => getRemaining(targetDate));

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(getRemaining(targetDate)), 1000);
    return () => window.clearInterval(id);
  }, [targetDate]);

  const units: Array<[label: string, value: number]> = [
    ["Days", remaining.days],
    ["Hours", remaining.hours],
    ["Minutes", remaining.minutes],
    ["Seconds", remaining.seconds],
  ];

  return (
    <section id="drop" className="border-y border-border bg-bg-raised">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center md:px-12">
        <Eyebrow numeral="VI">The Next Release</Eyebrow>
        <Text role="headingLg" as="h2" className="mt-6 max-w-2xl uppercase">
          {title || slug.replace(/-/g, ' ')} opens soon.
        </Text>

        <div className="mt-14 flex gap-8 md:gap-14">
          {units.map(([label, value]) => (
            <div key={label} className="flex flex-col items-center">
              <Text role="displaySm" as="span" className="tabular-nums" suppressHydrationWarning>
                {String(value).padStart(2, "0")}
              </Text>
              <Text role="label" as="span" className="mt-3">
                {label}
              </Text>
            </div>
          ))}
        </div>

        {/* Action Interface Architecture */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
          <Button variant="ghost" asChild>
            <a href="#reserve">Request early access</a>
          </Button>

          <Link 
            href={`/drops/${slug}`}
            className="group font-body text-[11px] uppercase tracking-label text-fg-subtle hover:text-fg transition-colors duration-200 py-2 inline-flex items-center gap-1.5"
          >
            <span>Explore Collection</span>
            <span className="text-xs transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}