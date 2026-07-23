"use client";

import { useState } from "react";
import { Text } from "@valenor/design-system";
import type { PieceVariantData } from "../server/queries";

/**
 * Selection state only — nothing to add to yet. Reservations (which is
 * where a selected variant actually matters) is Phase 7. This exists now
 * so the editorial product page doesn't look unfinished, and so the
 * selected variant is already in the right shape for whatever Phase 7
 * wires this into.
 */
export function VariantSelector({ variants }: { variants: PieceVariantData[] }) {
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null);

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
    </div>
  );
}
