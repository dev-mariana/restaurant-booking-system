import { RedisCacheAdapter } from "../cache/redis-cache.adapter.js";
import { ReservationRepository } from "../database/drizzle/repositories/reservation.repository.js";
import { TableRepository } from "../database/drizzle/repositories/table.repository.js";
import { logger } from "../logger/logger.js";
import { BullMQReservationQueue } from "../queue/bullmq.queue.adapter.js";

export type Dependencies = ReturnType<typeof makeDependencies>;

export function makeDependencies() {
  return {
    tableRepository: new TableRepository(),
    reservationRepository: new ReservationRepository(),
    cacheRepository: new RedisCacheAdapter(),
    reservationQueue: new BullMQReservationQueue(),
    logger,
  };
}
