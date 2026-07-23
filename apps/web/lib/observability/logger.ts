import pino from "pino";
import { env } from "../env";

/**
 * Structured JSON logging (architecture §19). In production this ships to
 * a log sink (Axiom/Betterstack per the stack table) via a transport
 * configured at deploy time — kept out of this file so the app doesn't
 * need to know which sink is in front of it (same abstraction discipline
 * as §12's provider interfaces).
 */
export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  base: { service: "valenor-web" },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Every request-scoped log call should go through a child logger carrying
 * the correlation ID, so a single request's log lines can be traced across
 * every domain call it touches (architecture §19). Middleware attaches the
 * ID; route handlers/server actions pull it back out.
 */
export function withCorrelationId(correlationId: string) {
  return logger.child({ correlationId });
}
