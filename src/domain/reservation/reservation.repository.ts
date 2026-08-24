import type { Reservation } from "./reservation.entity.js";

export interface IReservationRepository {
  create(reservation: Omit<Reservation, "updatedAt">): Promise<Reservation>;
  findById(id: string): Promise<Reservation | null>;
  findByCustomerEmail(email: string): Promise<Reservation[]>;
  findConfirmedByTableAndDate(tableId: string, date: Date): Promise<Reservation[]>;
  cancelReservation(id: string): Promise<void>;
}
