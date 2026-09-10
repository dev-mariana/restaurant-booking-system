import { makeConfirmReservationService } from "./infra/factories/make-confirm-reservation-service.js";
import { makeDependencies } from "./infra/factories/make-dependencies.js";
import { logger } from "./infra/logger/logger.js";
import { makeReservationWorker } from "./infra/queue/reservation.worker.js";

const dependencies = makeDependencies();
const confirmReservationService = makeConfirmReservationService(dependencies);

const worker = makeReservationWorker(confirmReservationService);

worker.on("completed", (job) => {
  logger.info({ reservationId: job.data.reservationId }, "Reservation processed");
});

worker.on("failed", (job, error) => {
  logger.error(
    { reservationId: job?.data.reservationId, err: error },
    "Reservation failed to process",
  );
});

logger.info("Reservation worker started");

async function shutdown(): Promise<void> {
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
