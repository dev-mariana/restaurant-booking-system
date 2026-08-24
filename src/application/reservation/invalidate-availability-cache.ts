import type { ICacheRepository } from "../../domain/cache/cache.repository.js";
import type { Reservation } from "../../domain/reservation/reservation.entity.js";
import { buildAvailabilityCacheKey } from "../../domain/table/availability.js";

export async function invalidateAvailabilityCache(
  cacheRepository: ICacheRepository,
  reservation: Reservation,
): Promise<void> {
  await cacheRepository.del(buildAvailabilityCacheKey(reservation.tableId, reservation.slotStart));
}
