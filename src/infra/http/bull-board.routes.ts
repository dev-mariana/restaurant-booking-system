import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { Queue } from "bullmq";
import type { Hono } from "hono";
import { Redis } from "ioredis";
import { env } from "../env/env.js";
import type { ConfirmReservationJobData } from "../queue/bullmq.queue.adapter.js";

export function createBullBoardRoutes(): Hono {
  const queue = new Queue<ConfirmReservationJobData>(env.RESERVATION_QUEUE_NAME, {
    connection: new Redis(env.REDIS_URL, { maxRetriesPerRequest: null }),
  });

  const serverAdapter = new HonoAdapter(serveStatic);

  createBullBoard({
    queues: [new BullMQAdapter(queue)],
    serverAdapter,
  });

  serverAdapter.setBasePath(env.BULL_BOARD_BASE_PATH);

  return serverAdapter.registerPlugin();
}
