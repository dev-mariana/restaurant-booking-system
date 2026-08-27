import { Queue } from "bullmq";
import { Redis } from "ioredis";
import type { IReservationQueue } from "../../domain/queue/reservation-queue.js";
import { env } from "../env/env.js";

export type ConfirmReservationJobData = {
  reservationId: string;
  tableId: string;
};

export class BullMQReservationQueue implements IReservationQueue {
  private readonly queue = new Queue<ConfirmReservationJobData>(env.RESERVATION_QUEUE_NAME, {
    connection: new Redis(env.REDIS_URL, { maxRetriesPerRequest: null }),
  });

  async enqueueConfirmation(reservationId: string, tableId: string): Promise<void> {
    await this.queue.add(env.CONFIRM_RESERVATION_JOB_NAME, { reservationId, tableId });
  }
}
