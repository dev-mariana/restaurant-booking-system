import { makeConfirmReservationService } from "./infra/factories/make-confirm-reservation-service.js";
import { makeDependencies } from "./infra/factories/make-dependencies.js";
import { makeReservationWorker } from "./infra/queue/reservation.worker.js";

const dependencies = makeDependencies();
const confirmReservationService = makeConfirmReservationService(dependencies);

const worker = makeReservationWorker(confirmReservationService);

worker.on("completed", (job) => {
  console.log(`Reservation ${job.data.reservationId} processed.`);
});

worker.on("failed", (job, error) => {
  console.error(`Reservation ${job?.data.reservationId} failed to process.`, error);
});

console.log("Reservation worker started.");

async function shutdown(): Promise<void> {
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
