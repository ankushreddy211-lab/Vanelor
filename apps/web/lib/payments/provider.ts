import { logger } from "../observability/logger";

/**
 * Architecture §12: createIntent()/confirm()/refund(), provider-agnostic.
 * Real eSewa/Khalti (India-first) and Stripe (future international)
 * adapters are Phase 9+ work — same honest-stub pattern as
 * lib/comms/provider.ts in Phase 4. What's real: every call site in
 * features/reservations already goes through this interface, never a
 * vendor SDK directly, so the swap touches one file.
 */
export interface PaymentIntent {
  id: string;
  status: "requires_action" | "succeeded" | "failed";
  amount: number;
  currency: string;
}

export interface PaymentProvider {
  createIntent(params: { amount: number; currency: string; reservationId: string }): Promise<PaymentIntent>;
  /** Called from a webhook handler in production; here, from the dev-only simulate-payment action. */
  confirm(intentId: string): Promise<PaymentIntent>;
  refund(intentId: string): Promise<{ refunded: boolean }>;
}

class StubPaymentProvider implements PaymentProvider {
  async createIntent(params: { amount: number; currency: string; reservationId: string }): Promise<PaymentIntent> {
    const id = `stub_${params.reservationId}`;
    logger.info(params, "[stub] payment intent created — no real charge attempted");
    return { id, status: "requires_action", amount: params.amount, currency: params.currency };
  }

  async confirm(intentId: string): Promise<PaymentIntent> {
    logger.info({ intentId }, "[stub] payment confirmed — no real charge occurred");
    return { id: intentId, status: "succeeded", amount: 0, currency: "INR" };
  }

  async refund(intentId: string): Promise<{ refunded: boolean }> {
    logger.info({ intentId }, "[stub] refund issued — no real reversal occurred");
    return { refunded: true };
  }
}

export const paymentProvider: PaymentProvider = new StubPaymentProvider();
