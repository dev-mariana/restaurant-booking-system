import { Worker } from "bullmq";
import { Redis } from "ioredis";
import type { ConfirmReservationService } from "../../application/reservation/services/confirm-reservation.service.js";
import { env } from "../env/env.js";
import type { ConfirmReservationJobData } from "./bullmq.queue.adapter.js";

const tableLocks = new Map<string, Promise<void>>();

export function runSerializedByTable<T>(tableId: string, task: () => Promise<T>): Promise<T> {
  const previousLock = tableLocks.get(tableId) ?? Promise.resolve();
  const run = previousLock.then(task, task);

  tableLocks.set(
    tableId,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );

  return run;
}

export function makeReservationWorker(
  confirmReservationService: ConfirmReservationService,
): Worker<ConfirmReservationJobData> {
  return new Worker<ConfirmReservationJobData>(
    env.RESERVATION_QUEUE_NAME,
    async (job) => {
      const { reservationId, tableId } = job.data;

      await runSerializedByTable(tableId, () => confirmReservationService.execute(reservationId));
    },
    {
      connection: new Redis(env.REDIS_URL, { maxRetriesPerRequest: null }),
      concurrency: env.WORKER_CONCURRENCY,
    },
  );
}
