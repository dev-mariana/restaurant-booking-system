import type { Reservation, ReservationStatus } from "./reservation.entity.js";

export interface IReservationRepository {
  create(reservation: Omit<Reservation, "createdAt" | "updatedAt">): Promise<Reservation>;
  findById(id: string): Promise<Reservation | null>;
  findByCustomerEmail(email: string): Promise<Reservation[]>;
  findConfirmedByTableAndDate(tableId: string, date: Date): Promise<Reservation[]>;
  updateStatus(id: string, status: ReservationStatus): Promise<Reservation>;
}
