import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { timeSlotsOverlap } from "../../../common/time-slot.js";
import type { ICacheRepository } from "../../../domain/cache/cache.repository.js";
import type { Reservation } from "../../../domain/reservation/reservation.entity.js";
import { ReservationStatus } from "../../../domain/reservation/reservation.entity.js";
import type { IReservationRepository } from "../../../domain/reservation/reservation.repository.js";
import { buildAvailabilityCacheKey } from "../../../domain/table/availability.js";

export class ConfirmReservationService {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly cacheRepository: ICacheRepository,
  ) {}

  async execute(reservationId: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(reservationId);

    if (!reservation) {
      throw new NotFoundError(`Reservation ${reservationId} not found.`);
    }

    if (reservation.status !== ReservationStatus.Pending) {
      return reservation;
    }

    const status = (await this.hasOverlap(reservation))
      ? ReservationStatus.Rejected
      : ReservationStatus.Confirmed;

    const updated = await this.reservationRepository.updateStatus(reservationId, status);

    await this.invalidateAvailabilityCache(reservation);

    return updated;
  }

  private async hasOverlap(reservation: Reservation): Promise<boolean> {
    const confirmedReservations = await this.reservationRepository.findConfirmedByTableAndDate(
      reservation.tableId,
      reservation.slotStart,
    );

    return confirmedReservations.some((existing) =>
      timeSlotsOverlap(
        { start: reservation.slotStart, end: reservation.slotEnd },
        { start: existing.slotStart, end: existing.slotEnd },
      ),
    );
  }

  private async invalidateAvailabilityCache(reservation: Reservation): Promise<void> {
    await this.cacheRepository.del(
      buildAvailabilityCacheKey(reservation.tableId, reservation.slotStart),
    );
  }
}
