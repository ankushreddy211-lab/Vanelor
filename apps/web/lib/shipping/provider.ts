import { logger } from "../observability/logger";

/**
 * Architecture §12: createShipment()/getRates()/trackShipment(). Real
 * courier integration is Phase 9+ work. What's real: ShipmentRecord
 * already exists in the schema (Phase 3) and the confirmation saga
 * (confirm.ts) already creates one — this stub is what it calls today.
 */
export interface ShippingProvider {
  createShipment(params: { orderId: string; addressLine1: string; city: string }): Promise<{ trackingNumber: string }>;
}

class StubShippingProvider implements ShippingProvider {
  async createShipment(params: { orderId: string; addressLine1: string; city: string }) {
    const trackingNumber = `MANUAL-${params.orderId.slice(0, 8)}`;
    logger.info({ ...params, trackingNumber }, "[stub] shipment created — manual courier assignment required");
    return { trackingNumber };
  }
}

export const shippingProvider: ShippingProvider = new StubShippingProvider();
