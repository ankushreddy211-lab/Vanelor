import { logger } from "../observability/logger";

/**
 * Architecture §12: every external dependency is accessed through a
 * provider interface, never a vendor SDK imported directly into feature
 * code. This is that interface for the two channels auth needs —
 * SMS/WhatsApp OTP and transactional email — settled now (Phase 4) rather
 * than left until Phase 9 builds the full Comms domain, because OTP
 * delivery reliability is flagged as this phase's own top risk.
 *
 * Today's implementation just logs — real WhatsApp Business Cloud API and
 * Resend wiring is Phase 9 work. Every call site (the Better Auth plugin
 * callbacks in `auth.ts`) already goes through this interface, so that
 * swap touches one file.
 */
export interface CommsProvider {
  sendSmsOtp(params: { phoneNumber: string; code: string }): Promise<void>;
  sendMagicLinkEmail(params: { email: string; url: string }): Promise<void>;
  sendReservationConfirmation(params: { email: string | null; orderId: string; pieceTitle: string }): Promise<void>;
}

class LoggingCommsProvider implements CommsProvider {
  async sendSmsOtp({ phoneNumber, code }: { phoneNumber: string; code: string }) {
    // TODO(Phase 9): WhatsApp Business Cloud API adapter, per architecture §12.
    logger.info({ phoneNumber, code }, "[stub] SMS OTP not actually sent — logged only");
  }

  async sendMagicLinkEmail({ email, url }: { email: string; url: string }) {
    // TODO(Phase 9): Resend adapter, per architecture §12.
    logger.info({ email, url }, "[stub] magic link email not actually sent — logged only");
  }

  async sendReservationConfirmation(params: { email: string | null; orderId: string; pieceTitle: string }) {
    // TODO(Phase 9): Resend + WhatsApp Business Cloud API dispatch, per
    // architecture §11.4's confirmation saga and §12's abstraction layer.
    logger.info(params, "[stub] reservation confirmation not actually sent — logged only");
  }
}

export const commsProvider: CommsProvider = new LoggingCommsProvider();
