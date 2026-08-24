import { ConflictError } from "../../../common/errors/conflict-error.js";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { ICacheRepository } from "../../../domain/cache/cache.repository.js";
import type { Reservation } from "../../../domain/reservation/reservation.entity.js";
import { ReservationStatus } from "../../../domain/reservation/reservation.entity.js";
import type { IReservationRepository } from "../../../domain/reservation/reservation.repository.js";
import { invalidateAvailabilityCache } from "../invalidate-availability-cache.js";

const CANCELLABLE_STATUSES = [ReservationStatus.Pending, ReservationStatus.Confirmed];

export class CancelReservationService {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly cacheRepository: ICacheRepository,
  ) {}

  async execute(reservationId: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(reservationId);

    if (!reservation) {
      throw new NotFoundError(`Reservation ${reservationId} not found.`);
    }

    if (!CANCELLABLE_STATUSES.includes(reservation.status)) {
      throw new ConflictError(
        `Reservation ${reservationId} cannot be cancelled from status ${reservation.status}.`,
      );
    }

    const updated = await this.reservationRepository.updateStatus(
      reservationId,
      ReservationStatus.Cancelled,
    );

    await invalidateAvailabilityCache(this.cacheRepository, reservation);

    return updated;
  }
}
