import type {
  Reservation,
  ReservationStatus,
} from "../../../../domain/reservation/reservation.entity.js";
import type { reservations } from "../schema.js";

type ReservationRow = typeof reservations.$inferSelect;
type NewReservationRow = typeof reservations.$inferInsert;

// biome-ignore lint/complexity/noStaticOnlyClass: mapper follows a static-only class convention
export class ReservationMapper {
  static toDomain(raw: ReservationRow): Reservation {
    return {
      id: raw.id,
      tableId: raw.tableId,
      customerName: raw.customerName,
      customerEmail: raw.customerEmail,
      slotStart: raw.slotStart,
      slotEnd: raw.slotEnd,
      status: raw.status as ReservationStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toDrizzle(reservation: Reservation): NewReservationRow {
    return {
      id: reservation.id,
      tableId: reservation.tableId,
      customerName: reservation.customerName,
      customerEmail: reservation.customerEmail,
      slotStart: reservation.slotStart,
      slotEnd: reservation.slotEnd,
      status: reservation.status,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    };
  }
}
