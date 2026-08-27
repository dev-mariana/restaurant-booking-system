import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { getDayRange } from "../../../common/helpers/day-range.js";
import type { ICacheRepository } from "../../../domain/cache/cache.repository.js";
import type { IReservationRepository } from "../../../domain/reservation/reservation.repository.js";
import {
  type AvailabilitySlot,
  buildAvailabilityCacheKey,
  computeAvailability,
} from "../../../domain/table/availability.js";
import type { ITableRepository } from "../../../domain/table/table.repository.js";

const CACHE_TTL_SECONDS = 60;

export class GetAvailabilityService {
  constructor(
    private readonly tableRepository: ITableRepository,
    private readonly reservationRepository: IReservationRepository,
    private readonly cacheRepository: ICacheRepository,
  ) {}

  async execute(tableId: string, date: Date): Promise<AvailabilitySlot[]> {
    const table = await this.tableRepository.findById(tableId);

    if (!table) {
      throw new NotFoundError(`Table ${tableId} not found.`);
    }

    const { start: dayStart } = getDayRange(date);
    const cacheKey = buildAvailabilityCacheKey(tableId, dayStart);

    const cached = await this.cacheRepository.get<AvailabilitySlot[]>(cacheKey);

    if (cached) {
      return cached;
    }

    return this.cacheAvailability(tableId, dayStart, cacheKey);
  }

  private async cacheAvailability(
    tableId: string,
    dayStart: Date,
    cacheKey: string,
  ): Promise<AvailabilitySlot[]> {
    const confirmedReservations = await this.reservationRepository.findConfirmedByTableAndDate(
      tableId,
      dayStart,
    );

    const slots = computeAvailability(dayStart, confirmedReservations);

    await this.cacheRepository.set(cacheKey, slots, CACHE_TTL_SECONDS);

    return slots;
  }
}
