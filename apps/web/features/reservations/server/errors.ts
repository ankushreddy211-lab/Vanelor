export class InsufficientStockError extends Error {
  constructor(variantId: string) {
    super(`Insufficient stock for variant "${variantId}"`);
    this.name = "InsufficientStockError";
  }
}

export class ReservationNotFoundError extends Error {
  constructor(id: string) {
    super(`Reservation "${id}" not found`);
    this.name = "ReservationNotFoundError";
  }
}

export class VariantNotInDropError extends Error {
  constructor(variantId: string, dropSlug: string) {
    super(`Variant "${variantId}" is not part of drop "${dropSlug}"`);
    this.name = "VariantNotInDropError";
  }
}
