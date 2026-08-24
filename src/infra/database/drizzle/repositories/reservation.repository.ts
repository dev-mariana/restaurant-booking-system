import { and, eq, gt, lt } from "drizzle-orm";
import { getDayRange } from "../../../../common/day-range.js";
import {
  type Reservation,
  ReservationStatus,
} from "../../../../domain/reservation/reservation.entity.js";
import type {
  IReservationRepository,
  NewReservation,
} from "../../../../domain/reservation/reservation.repository.js";
import { db } from "../config.js";
import { ReservationMapper } from "../mappers/reservation.mapper.js";
import { reservations } from "../schema.js";

export class ReservationRepository implements IReservationRepository {
  async create(reservation: NewReservation): Promise<Reservation> {
    const [row] = await db
      .insert(reservations)
      .values(ReservationMapper.toDrizzle(reservation))
      .returning();

    return ReservationMapper.toDomain(row);
  }

  async findById(id: string): Promise<Reservation | null> {
    const [row] = await db.select().from(reservations).where(eq(reservations.id, id));

    return row ? ReservationMapper.toDomain(row) : null;
  }

  async findByCustomerEmail(email: string): Promise<Reservation[]> {
    const rows = await db.select().from(reservations).where(eq(reservations.customerEmail, email));

    return rows.map(ReservationMapper.toDomain);
  }

  async findConfirmedByTableAndDate(tableId: string, date: Date): Promise<Reservation[]> {
    const { start, end } = getDayRange(date);

    const rows = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.tableId, tableId),
          eq(reservations.status, ReservationStatus.Confirmed),
          lt(reservations.slotStart, end),
          gt(reservations.slotEnd, start),
        ),
      );

    return rows.map(ReservationMapper.toDomain);
  }

  async cancelReservation(id: string): Promise<void> {
    await db
      .update(reservations)
      .set({ status: ReservationStatus.Cancelled })
      .where(eq(reservations.id, id));
  }
}
