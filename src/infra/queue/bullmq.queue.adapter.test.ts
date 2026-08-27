import { beforeEach, describe, expect, it, vi } from "vitest";
import { createId } from "../../common/helpers/generate-id.js";

const addMock = vi.fn();

vi.mock("bullmq", () => ({
  Queue: vi.fn().mockImplementation(function Queue() {
    return { add: addMock };
  }),
}));

vi.mock("ioredis", () => ({
  Redis: vi.fn().mockImplementation(function Redis() {
    return {};
  }),
}));

vi.mock("../env/env.js", () => ({
  env: {
    REDIS_URL: "redis://localhost:6379",
    RESERVATION_QUEUE_NAME: "queue-name",
    CONFIRM_RESERVATION_JOB_NAME: "job-name",
  },
}));

describe("BullMQReservationQueue", () => {
  beforeEach(() => {
    addMock.mockClear();
  });

  it("enqueues a job on the configured queue with the reservation and table ids", async () => {
    const { Queue } = await import("bullmq");
    const { BullMQReservationQueue } = await import("./bullmq.queue.adapter.js");

    const queue = new BullMQReservationQueue();

    const reservationId = createId();
    const tableId = createId();

    await queue.enqueueConfirmation(reservationId, tableId);

    expect(Queue).toHaveBeenCalledWith("queue-name", expect.any(Object));
    expect(addMock).toHaveBeenCalledWith("job-name", { reservationId, tableId });
  });
});
