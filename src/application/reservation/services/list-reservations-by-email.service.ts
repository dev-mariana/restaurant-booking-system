import type { Reservation } from "../../../domain/reservation/reservation.entity.js";
import type { IReservationRepository } from "../../../domain/reservation/reservation.repository.js";

export class ListReservationsByEmailService {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(email: string): Promise<Reservation[]> {
    return this.reservationRepository.findByCustomerEmail(email);
  }
}
