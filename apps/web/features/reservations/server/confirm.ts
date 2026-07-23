import { prisma } from "@valenor/db";
import { assertValidTransition } from "@valenor/domain";
import { paymentProvider } from "../../../lib/payments/provider";
import { shippingProvider } from "../../../lib/shipping/provider";
import { commsProvider } from "../../../lib/comms/provider";
import { logger } from "../../../lib/observability/logger";
import { ReservationNotFoundError } from "./errors";
import type { ReservationTxClient } from "./tx-types";

export async function setShippingDetail(
  reservationId: string,
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region?: string;
    postalCode?: string;
    country: string;
    phone: string;
  }
): Promise<void> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: { status: true },
  });
  if (!reservation) throw new ReservationNotFoundError(reservationId);

  await prisma.shippingDetail.upsert({
    where: { reservationId },
    update: address,
    create: { reservationId, ...address },
  });
}

/** HELD → AWAITING_PAYMENT. Creates the payment intent via the provider abstraction (architecture §12). */
export async function initiatePayment(reservationId: string): Promise<{ intentId: string }> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      status: true,
      shippingDetail: { select: { id: true } },
      lines: { select: { quantity: true, unitPriceSnapshot: true } },
    },
  });
  if (!reservation) throw new ReservationNotFoundError(reservationId);
  if (!reservation.shippingDetail) {
    throw new Error("Cannot initiate payment before shipping details are set");
  }
  assertValidTransition(reservation.status as never, "AWAITING_PAYMENT");

  const amount = reservation.lines.reduce(
    (sum: number, line: { quantity: number; unitPriceSnapshot: unknown }) => sum + line.quantity * Number(line.unitPriceSnapshot),
    0
  );

  const intent = await paymentProvider.createIntent({ amount, currency: "INR", reservationId });

  await prisma.$transaction([
    prisma.reservation.update({ where: { id: reservationId }, data: { status: "AWAITING_PAYMENT" } }),
    prisma.reservationEvent.create({
      data: { reservationId, fromStatus: "HELD", toStatus: "AWAITING_PAYMENT" },
    }),
    prisma.paymentAttempt.create({
      data: { reservationId, provider: "ESEWA", status: "INITIATED", amount, currency: "INR", providerRef: intent.id },
    }),
  ]);

  return { intentId: intent.id };
}

/**
 * Dev-only trigger standing in for a real payment webhook (production: a
 * signed callback from eSewa/Khalti hits an /api/webhooks/v1/payment route
 * — see architecture §8 — and calls this same function). Runs the saga:
 * payment succeeded → Reservation.CONFIRMED → Order created →
 * ShipmentRecord initialized → confirmation dispatched. The first three
 * steps are one transaction (they must be atomic — a confirmed order with
 * no payment record, or vice versa, is a real money bug). Shipment
 * creation and comms dispatch happen after, deliberately outside that
 * transaction and wrapped so their failure can't roll back a payment
 * that already succeeded — exactly architecture §11.4's own example.
 */
export async function confirmReservation(reservationId: string): Promise<{ orderId: string }> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      userId: true,
      status: true,
      lines: { select: { variantId: true, quantity: true, unitPriceSnapshot: true } },
      paymentAttempts: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, providerRef: true } },
    },
  });
  if (!reservation) throw new ReservationNotFoundError(reservationId);
  assertValidTransition(reservation.status as never, "CONFIRMED");

  const latestAttempt = reservation.paymentAttempts[0];
  if (!latestAttempt?.providerRef) {
    throw new Error("No payment attempt to confirm");
  }
  const confirmed = await paymentProvider.confirm(latestAttempt.providerRef);
  if (confirmed.status !== "succeeded") {
    throw new Error(`Payment did not succeed (status: ${confirmed.status})`);
  }

  const order = await prisma.$transaction(async (tx: ReservationTxClient) => {
    await tx.paymentAttempt.update({ where: { id: latestAttempt.id }, data: { status: "SUCCEEDED" } });
    await tx.reservation.update({ where: { id: reservationId }, data: { status: "CONFIRMED" } });
    await tx.reservationEvent.create({
      data: { reservationId, fromStatus: "AWAITING_PAYMENT", toStatus: "CONFIRMED" },
    });

    const createdOrder = await tx.order.create({
      data: {
        reservationId,
        userId: reservation.userId,
        status: "CONFIRMED",
        lines: {
          create: reservation.lines.map((line: { variantId: string; quantity: number; unitPriceSnapshot: unknown }) => ({
            variantId: line.variantId,
            quantity: line.quantity,
            unitPrice: line.unitPriceSnapshot as never,
          })),
        },
      },
      select: { id: true },
    });

    for (const line of reservation.lines) {
      await tx.inventoryLedgerEntry.create({
        data: { variantId: line.variantId, type: "SELL", quantity: line.quantity, reservationId },
      });
    }

    return createdOrder;
  });

  // Best-effort from here — payment and order are already durably
  // committed above. A shipment-creation or comms failure gets logged,
  // not thrown, so it can never undo a real, already-confirmed sale.
  try {
    const shippingDetail = await prisma.shippingDetail.findUnique({ where: { reservationId } });
    const shipment = await shippingProvider.createShipment({
      orderId: order.id,
      addressLine1: shippingDetail?.addressLine1 ?? "",
      city: shippingDetail?.city ?? "",
    });
    await prisma.shipmentRecord.create({
      data: { orderId: order.id, status: "LABEL_CREATED", trackingNumber: shipment.trackingNumber },
    });
  } catch (error) {
    logger.error({ error, orderId: order.id }, "Shipment creation failed after confirmed order");
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: reservation.userId }, select: { email: true } });
    const firstLine = reservation.lines[0];
    const variant = firstLine
      ? await prisma.variant.findUnique({ where: { id: firstLine.variantId }, select: { piece: { select: { title: true } } } })
      : null;
    await commsProvider.sendReservationConfirmation({
      email: user?.email ?? null,
      orderId: order.id,
      pieceTitle: variant?.piece.title ?? "your piece",
    });
  } catch (error) {
    logger.error({ error, orderId: order.id }, "Confirmation dispatch failed after confirmed order");
  }

  return { orderId: order.id };
}
