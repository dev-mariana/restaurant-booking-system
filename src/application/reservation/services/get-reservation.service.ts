import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { type ILogger, noopLogger } from "../../../domain/logger/logger.js";
import type { Reservation } from "../../../domain/reservation/reservation.entity.js";
import type { IReservationRepository } from "../../../domain/reservation/reservation.repository.js";

export class GetReservationService {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly logger: ILogger = noopLogger,
  ) {}

  async execute(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id);

    if (!reservation) {
      this.logger.warn({ reservationId: id }, "Reservation lookup miss");

      throw new NotFoundError(`Reservation ${id} not found.`);
    }

    return reservation;
  }
}
