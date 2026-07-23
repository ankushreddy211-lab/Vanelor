"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../../../lib/auth/session";
import { assertCanForUser } from "../../../lib/auth/rbac";
import { createHold } from "./hold";
import { setShippingDetail, initiatePayment, confirmReservation as confirmReservationSaga } from "./confirm";
import { cancelReservation as cancelReservationDomain } from "./cancel";
import { getReservationById } from "./queries";

async function requireCaller(action: string) {
  const session = await getSession();
  if (!session) throw new Error("Not signed in");
  await assertCanForUser(session.userId, action);
  return session;
}

/**
 * The real version of Phase 6's `attemptReservation` demo. Same gate call
 * underneath (createHold calls assertDropIsLive internally as its first
 * step) — this is what that gate was always meant to protect.
 */
export async function reserve(dropSlug: string, variantId: string, quantity: number) {
  const session = await requireCaller("reservation:create");
  const result = await createHold({ userId: session.userId, dropSlug, variantId, quantity });
  return result;
}

export async function submitShippingAndPay(
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
) {
  const session = await requireCaller("reservation:view_own");
  const reservation = await getReservationById(reservationId);
  if (reservation.userId !== session.userId) {
    throw new Error("Not your reservation");
  }

  await setShippingDetail(reservationId, address);
  const { intentId } = await initiatePayment(reservationId);
  revalidatePath(`/reservation/${reservationId}`);
  return { intentId };
}

/** Dev-only — stands in for the real payment webhook. See confirm.ts's confirmReservation doc comment. */
export async function simulatePaymentSuccess(reservationId: string) {
  const session = await requireCaller("reservation:view_own");
  const reservation = await getReservationById(reservationId);
  if (reservation.userId !== session.userId) {
    throw new Error("Not your reservation");
  }

  const { orderId } = await confirmReservationSaga(reservationId);
  revalidatePath(`/reservation/${reservationId}`);
  return { orderId };
}

export async function cancelOwnReservation(reservationId: string) {
  const session = await requireCaller("reservation:view_own");
  const reservation = await getReservationById(reservationId);
  if (reservation.userId !== session.userId) {
    throw new Error("Not your reservation");
  }
  await cancelReservationDomain(reservationId);
  revalidatePath(`/reservation/${reservationId}`);
}

/** Ops override — cancel any reservation, not just your own. */
export async function adminCancelReservation(reservationId: string) {
  await requireCaller("reservation:override");
  await cancelReservationDomain(reservationId);
  revalidatePath("/admin/reservations");
}
