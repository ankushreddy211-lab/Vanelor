"use client";

import { useEffect, useState } from "react";
import { computeDropStatus, type DropStatus } from "@valenor/domain";
import { Eyebrow, Text } from "@valenor/design-system";

function getRemaining(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/**
 * `liveAt`/`endsAt` arrive as ISO strings (Server Components can't pass
 * Date objects to Client Components directly). This display is
 * decorative only — the actual gate on any reservation attempt is
 * `features/drops/server/gating.ts`, which recomputes from the server
 * clock and never trusts anything this component computes.
 */
export function DropCountdown({ liveAt, endsAt }: { liveAt: string; endsAt: string }) {
  const liveAtMs = new Date(liveAt).getTime();
  const endsAtMs = new Date(endsAt).getTime();

  const [status, setStatus] = useState<DropStatus>(() =>
    computeDropStatus({ liveAt: new Date(liveAt), endsAt: new Date(endsAt) }, new Date())
  );
  const [remaining, setRemaining] = useState(() =>
    getRemaining(status === "SCHEDULED" ? liveAtMs : endsAtMs)
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = new Date();
      const nextStatus = computeDropStatus({ liveAt: new Date(liveAt), endsAt: new Date(endsAt) }, now);
      setStatus(nextStatus);
      setRemaining(getRemaining(nextStatus === "SCHEDULED" ? liveAtMs : endsAtMs));
    }, 1000);
    return () => window.clearInterval(id);
  }, [liveAt, endsAt, liveAtMs, endsAtMs]);

  if (status === "ENDED") {
    return (
      <div className="text-center">
        <Eyebrow>Ended</Eyebrow>
        <Text role="body" as="p" className="mt-4 text-fg-muted">
          This chapter has closed. See the Archive.
        </Text>
      </div>
    );
  }

  const units: Array<[string, number]> = [
    ["Days", remaining.days],
    ["Hours", remaining.hours],
    ["Minutes", remaining.minutes],
    ["Seconds", remaining.seconds],
  ];

  return (
    <div className="text-center">
      <Eyebrow>{status === "LIVE" ? "Closes in" : "Opens in"}</Eyebrow>
      <div className="mt-8 flex justify-center gap-8 md:gap-14">
        {units.map(([label, value]) => (
          <div key={label} className="flex flex-col items-center">
            <Text role="displaySm" as="span" className="tabular-nums">
              {String(value).padStart(2, "0")}
            </Text>
            <Text role="label" as="span" className="mt-3">
              {label}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
