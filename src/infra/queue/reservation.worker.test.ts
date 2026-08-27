import { describe, expect, it } from "vitest";
import { createId } from "../../common/generate-id.js";
import { runSerializedByTable } from "./reservation.worker.js";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("runSerializedByTable", () => {
  it("does not start the next task for the same table before the previous one settles", async () => {
    const tableId = createId();
    const order: string[] = [];
    const first = createDeferred<void>();

    const firstRun = runSerializedByTable(tableId, async () => {
      order.push("first-start");
      await first.promise;
      order.push("first-end");
    });

    const secondRun = runSerializedByTable(tableId, async () => {
      order.push("second-start");
    });

    await Promise.resolve();
    await Promise.resolve();
    expect(order).toEqual(["first-start"]);

    first.resolve();
    await firstRun;
    await secondRun;

    expect(order).toEqual(["first-start", "first-end", "second-start"]);
  });

  it("runs tasks for different tables concurrently", async () => {
    const tableA = createId();
    const tableB = createId();
    const order: string[] = [];
    const pendingA = createDeferred<void>();

    const runA = runSerializedByTable(tableA, async () => {
      order.push("a-start");
      await pendingA.promise;
      order.push("a-end");
    });

    const runB = runSerializedByTable(tableB, async () => {
      order.push("b-start");
    });

    await runB;
    expect(order).toEqual(["a-start", "b-start"]);

    pendingA.resolve();
    await runA;

    expect(order).toEqual(["a-start", "b-start", "a-end"]);
  });

  it("still runs the next task for the table even if the previous one rejects", async () => {
    const tableId = createId();
    const order: string[] = [];

    await expect(
      runSerializedByTable(tableId, async () => {
        order.push("failing");
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    await runSerializedByTable(tableId, async () => {
      order.push("recovered");
    });

    expect(order).toEqual(["failing", "recovered"]);
  });
});
