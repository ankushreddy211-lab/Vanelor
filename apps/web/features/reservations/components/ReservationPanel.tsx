"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Text, Button } from "@valenor/design-system";
import { reserve } from "../server/actions";
import type { PieceVariantData } from "../../catalog/server/queries";

export function ReservationPanel({ dropSlug, variants }: { dropSlug: string; variants: PieceVariantData[] }) {
  const router = useRouter();
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const selectedVariant = variants.find((v) => v.size === selectedSize);

  if (variants.length === 0) {
    return (
      <Text role="caption" as="p" className="text-fg-subtle">
        No variants configured yet.
      </Text>
    );
  }

  return (
    <div>
      <Text role="label" as="p" className="mb-3">
        Size
      </Text>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setSelectedSize(size)}
            className={`h-11 min-w-11 border px-3 text-sm transition-colors ${
              selectedSize === size
                ? "border-accent-strong text-accent-strong"
                : "border-border text-fg-muted hover:border-fg-muted"
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {selectedVariant && (
        <Text role="bodySm" as="p" className="mt-4 text-fg-muted">
          INR {selectedVariant.price.toLocaleString()}
        </Text>
      )}

      <Button
        variant="primary"
        className="mt-6 w-full"
        disabled={pending || !selectedVariant}
        onClick={() => {
          if (!selectedVariant) return;
          setError(null);
          startTransition(async () => {
            try {
              const { reservationId } = await reserve(dropSlug, selectedVariant.id, 1);
              router.push(`/reservation/${reservationId}`);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Couldn't reserve this piece.");
            }
          });
        }}
      >
        {pending ? "Reserving…" : "Reserve"}
      </Button>

      {error && (
        <Text role="caption" as="p" className="mt-3 text-accent-strong">
          {error}
        </Text>
      )}

      <Text role="caption" as="p" className="mt-4 text-fg-subtle">
        Held for 10 minutes. Payment is simulated in this environment — see
        the reservation page for details.
      </Text>
    </div>
  );
}
