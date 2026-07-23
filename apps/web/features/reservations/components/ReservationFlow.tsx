"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Text, Input, Button } from "@valenor/design-system";
import { submitShippingAndPay, simulatePaymentSuccess, cancelOwnReservation } from "../server/actions";
import type { ReservationDetail } from "../server/queries";

export function ReservationFlow({ reservation }: { reservation: ReservationDetail }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  function handleShippingSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await submitShippingAndPay(reservation.id, {
          addressLine1,
          city,
          phone,
          country: "NP",
        });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save shipping details.");
      }
    });
  }

  function handleSimulatePayment() {
    setError(null);
    startTransition(async () => {
      try {
        await simulatePaymentSuccess(reservation.id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment simulation failed.");
      }
    });
  }

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      try {
        await cancelOwnReservation(reservation.id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't cancel.");
      }
    });
  }

  if (reservation.status === "HELD" && !reservation.hasShippingDetail) {
    return (
      <form onSubmit={handleShippingSubmit} className="flex flex-col gap-4">
        <Text role="label" as="p">
          Shipping details
        </Text>
        <Input placeholder="Address" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required />
        <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
        <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <Button type="submit" variant="primary" disabled={pending}>
          Continue to payment
        </Button>
        {error && (
          <Text role="caption" as="p" className="text-accent-strong">
            {error}
          </Text>
        )}
        <button type="button" onClick={handleCancel} className="label text-fg-subtle hover:text-fg">
          Cancel reservation
        </button>
      </form>
    );
  }

  if (reservation.status === "AWAITING_PAYMENT") {
    return (
      <div className="flex flex-col gap-4">
        <Text role="body" as="p" className="text-fg-muted">
          No real payment gateway is connected in this environment (see
          README — eSewa/Khalti integration is Phase 9 work). This button
          stands in for what a real webhook would do on successful payment.
        </Text>
        <Button variant="primary" disabled={pending} onClick={handleSimulatePayment}>
          Simulate successful payment
        </Button>
        {error && (
          <Text role="caption" as="p" className="text-accent-strong">
            {error}
          </Text>
        )}
        <button type="button" onClick={handleCancel} className="label text-fg-subtle hover:text-fg">
          Cancel reservation
        </button>
      </div>
    );
  }

  if (reservation.status === "CONFIRMED") {
    return (
      <div className="text-center">
        <Text role="headingSm" as="p" className="font-display italic text-accent-strong">
          Confirmed.
        </Text>
        <Text role="bodySm" as="p" className="mt-3 text-fg-muted">
          Order {reservation.orderId}. A confirmation has been logged (real
          dispatch is Phase 9 — see lib/comms/provider.ts).
        </Text>
      </div>
    );
  }

  if (reservation.status === "EXPIRED" || reservation.status === "CANCELLED") {
    return (
      <Text role="body" as="p" className="text-center text-fg-muted">
        This reservation is {reservation.status.toLowerCase()}. The hold has
        been released back to stock.
      </Text>
    );
  }

  return null;
}
