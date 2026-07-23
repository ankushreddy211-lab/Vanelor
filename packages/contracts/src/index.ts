import { z } from "zod";

/**
 * Contracts live here specifically so a tRPC procedure (Phase 7) and its
 * client-side form (Phase 6/7) validate against the exact same schema —
 * architecture §8: "shared between client and server, so form validation
 * and API validation can never drift apart."
 *
 * This file seeds the pattern with the Reservation domain, the highest-risk
 * flow on the platform. More contracts get added per-domain as each
 * feature is built (Catalog, Drops, CMS...) — not written speculatively
 * ahead of their consumers.
 */

export const createReservationInput = z.object({
  variantId: z.string().cuid(),
  quantity: z.number().int().min(1).max(2), // scarcity model — cap per line, tuned per drop later
});
export type CreateReservationInput = z.infer<typeof createReservationInput>;

export const confirmReservationInput = z.object({
  reservationId: z.string().cuid(),
  shippingDetail: z.object({
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    region: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().length(2).default("NP"),
    phone: z.string().min(7),
  }),
});
export type ConfirmReservationInput = z.infer<typeof confirmReservationInput>;

export const reservationStatus = z.enum([
  "PENDING",
  "HELD",
  "AWAITING_PAYMENT",
  "CONFIRMED",
  "EXPIRED",
  "CANCELLED",
]);
export type ReservationStatus = z.infer<typeof reservationStatus>;
