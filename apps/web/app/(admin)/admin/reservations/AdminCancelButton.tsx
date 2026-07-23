"use client";

import { useTransition } from "react";
import { Button } from "@valenor/design-system";
import { adminCancelReservation } from "../../../../features/reservations/server/actions";

export function AdminCancelButton({ reservationId }: { reservationId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => startTransition(() => adminCancelReservation(reservationId))}
    >
      Cancel
    </Button>
  );
}
