import { describe, expect, it, vi, beforeEach } from "vitest";

const findUniqueMock = vi.fn();
const transactionMock = vi.fn();
const delMock = vi.fn();

vi.mock("@valenor/db", () => ({
  prisma: {
    reservation: { findUnique: (...args: unknown[]) => findUniqueMock(...args) },
    $transaction: (...args: unknown[]) => transactionMock(...args),
  },
}));

vi.mock("../../../lib/redis/client", () => ({
  redis: { del: (...args: unknown[]) => delMock(...args) },
}));

const { cancelReservation } = await import("../server/cancel");

describe("cancelReservation", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    transactionMock.mockReset();
    delMock.mockReset();
    delMock.mockResolvedValue(1);
  });

  it("cancels a HELD reservation and releases its lines' stock", async () => {
    findUniqueMock.mockResolvedValue({
      status: "HELD",
      lines: [{ variantId: "variant-1", quantity: 2 }],
    });

    const tx = {
      reservation: { update: vi.fn() },
      reservationEvent: { create: vi.fn() },
      inventoryLedgerEntry: { create: vi.fn() },
    };
    transactionMock.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => fn(tx));

    await cancelReservation("res-1");

    expect(tx.reservation.update).toHaveBeenCalledWith({
      where: { id: "res-1" },
      data: { status: "CANCELLED" },
    });
    expect(tx.reservationEvent.create).toHaveBeenCalledWith({
      data: { reservationId: "res-1", fromStatus: "HELD", toStatus: "CANCELLED" },
    });
    expect(tx.inventoryLedgerEntry.create).toHaveBeenCalledWith({
      data: { variantId: "variant-1", type: "RELEASE", quantity: 2, reservationId: "res-1" },
    });
  });

  it("refuses to cancel an already-CONFIRMED reservation — the pure state machine rejects it before any write", async () => {
    findUniqueMock.mockResolvedValue({ status: "CONFIRMED", lines: [] });

    await expect(cancelReservation("res-1")).rejects.toThrow(
      "Cannot transition reservation from CONFIRMED to CANCELLED"
    );
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("throws ReservationNotFoundError for a missing reservation", async () => {
    findUniqueMock.mockResolvedValue(null);
    await expect(cancelReservation("missing")).rejects.toThrow('Reservation "missing" not found');
  });
});
