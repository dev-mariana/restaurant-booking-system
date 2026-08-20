import type { Reservation } from "./reservation.entity.js";

export interface IReservationRepository {
  create(reservation: Reservation): Promise<Reservation>;
  findById(id: string): Promise<Reservation | null>;
  findByCustomerEmail(email: string): Promise<Reservation[]>;
  cancelReservation(id: string): Promise<void>;
}
