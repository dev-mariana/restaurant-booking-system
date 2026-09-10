import type { ICacheRepository } from "../../domain/cache/cache.repository.js";
import type { ILogger } from "../../domain/logger/logger.js";
import type { IReservationQueue } from "../../domain/queue/reservation-queue.js";
import type { IReservationRepository } from "../../domain/reservation/reservation.repository.js";
import type { ITableRepository } from "../../domain/table/table.repository.js";
import { RedisCacheAdapter } from "../cache/redis-cache.adapter.js";
import { ReservationRepository } from "../database/drizzle/repositories/reservation.repository.js";
import { TableRepository } from "../database/drizzle/repositories/table.repository.js";
import { logger } from "../logger/logger.js";
import { BullMQReservationQueue } from "../queue/bullmq.queue.adapter.js";

export type Dependencies = {
  tableRepository: ITableRepository;
  reservationRepository: IReservationRepository;
  cacheRepository: ICacheRepository;
  reservationQueue: IReservationQueue;
  logger: ILogger;
};

export function makeDependencies(): Dependencies {
  return {
    tableRepository: new TableRepository(),
    reservationRepository: new ReservationRepository(),
    cacheRepository: new RedisCacheAdapter(),
    reservationQueue: new BullMQReservationQueue(),
    logger,
  };
}
