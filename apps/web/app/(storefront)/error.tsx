"use client";

import { useEffect } from "react";
import { Text, Button } from "@valenor/design-system";

/**
 * Architecture §19: "a 500 page is still a VALENOR experience, not a stack
 * trace." Phase 3's README flagged per-route-group error boundaries as
 * deferred until a route group had real content to protect — the
 * storefront now does.
 */
export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center text-fg">
      <Text role="label" as="p">
        The House
      </Text>
      <Text role="heading" as="h1" className="mt-4">
        The thread slipped.
      </Text>
      <Text role="body" as="p" className="mt-4 max-w-md text-fg-muted">
        Something didn&apos;t render the way it should have. We&apos;ve logged it —
        try again in a moment.
      </Text>
      <Button variant="secondary" onClick={reset} className="mt-8">
        Try again
      </Button>
    </main>
  );
}
