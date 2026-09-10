import { type ILogger, noopLogger } from "../../../domain/logger/logger.js";
import type { Reservation } from "../../../domain/reservation/reservation.entity.js";
import type { IReservationRepository } from "../../../domain/reservation/reservation.repository.js";

export class ListReservationsByEmailService {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly logger: ILogger = noopLogger,
  ) {}

  async execute(email: string): Promise<Reservation[]> {
    const reservations = await this.reservationRepository.findByCustomerEmail(email);

    this.logger.info({ email, count: reservations.length }, "Listed reservations by email");

    return reservations;
  }
}
