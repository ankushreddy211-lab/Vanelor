"use client";

import { Text, Button } from "@valenor/design-system";
import { useEffect } from "react";

/**
 * Root boundary for now. Architecture §19 calls for per-route-group
 * boundaries (storefront vs. admin get different fallback tone) — that
 * split happens as each route group grows real content in later phases;
 * one shared boundary is enough while (storefront)/(admin)/(auth) are
 * still scaffolds.
 */
export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center text-fg">
        <Text role="heading" as="h1">
          Something didn&apos;t hold.
        </Text>
        <Text role="body" as="p" className="mt-4 max-w-md text-fg-muted">
          We&apos;ve logged it. Try again, or come back in a moment.
        </Text>
        <Button variant="secondary" onClick={reset} className="mt-8">
          Try again
        </Button>
      </body>
    </html>
  );
}
