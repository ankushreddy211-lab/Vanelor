import { prisma } from "@valenor/db";
import { ReservationNotFoundError } from "./errors";

export interface ReservationDetail {
  id: string;
  userId: string;
  status: "PENDING" | "HELD" | "AWAITING_PAYMENT" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
  expiresAt: Date;
  lines: Array<{ variantId: string; quantity: number; unitPriceSnapshot: number; pieceTitle: string; size: string; colorway: string }>;
  hasShippingDetail: boolean;
  orderId: string | null;
}

export async function getReservationById(id: string): Promise<ReservationDetail> {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      lines: { include: { variant: { include: { piece: true } } } },
      shippingDetail: { select: { id: true } },
      order: { select: { id: true } },
    },
  });
  if (!reservation) throw new ReservationNotFoundError(id);

  return {
    id: reservation.id,
    userId: reservation.userId,
    status: reservation.status,
    expiresAt: reservation.expiresAt,
    lines: reservation.lines.map(
      (line: {
        variantId: string;
        quantity: number;
        unitPriceSnapshot: unknown;
        variant: { size: string; colorway: string; piece: { title: string } };
      }) => ({
        variantId: line.variantId,
        quantity: line.quantity,
        unitPriceSnapshot: Number(line.unitPriceSnapshot),
        pieceTitle: line.variant.piece.title,
        size: line.variant.size,
        colorway: line.variant.colorway,
      })
    ),
    hasShippingDetail: reservation.shippingDetail !== null,
    orderId: reservation.order?.id ?? null,
  };
}

export interface ReservationListItem {
  id: string;
  status: "PENDING" | "HELD" | "AWAITING_PAYMENT" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
  expiresAt: Date;
  createdAt: Date;
  userEmail: string | null;
  pieceTitles: string[];
}

export async function listReservationsForAdmin(): Promise<ReservationListItem[]> {
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true } }, lines: { include: { variant: { include: { piece: true } } } } },
  });

  return reservations.map(
    (r: {
      id: string;
      status: "PENDING" | "HELD" | "AWAITING_PAYMENT" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
      expiresAt: Date;
      createdAt: Date;
      user: { email: string | null };
      lines: Array<{ variant: { piece: { title: string } } }>;
    }) => ({
      id: r.id,
      status: r.status,
      expiresAt: r.expiresAt,
      createdAt: r.createdAt,
      userEmail: r.user.email,
      pieceTitles: r.lines.map((l) => l.variant.piece.title),
    })
  );
}

export interface LedgerEntryView {
  id: string;
  type: string;
  quantity: number;
  reservationId: string | null;
  createdAt: Date;
}

/** Admin diagnostic — the audit trail architecture §7.2 calls this ledger model out for providing. */
export async function getLedgerForVariant(variantId: string): Promise<LedgerEntryView[]> {
  return prisma.inventoryLedgerEntry.findMany({
    where: { variantId },
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, quantity: true, reservationId: true, createdAt: true },
  });
}
