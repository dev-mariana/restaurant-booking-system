import { Hono } from "hono";
import { env } from "./infra/env/env.js";
import { makeCreateReservationService } from "./infra/factories/make-create-reservation-service.js";
import { makeDependencies } from "./infra/factories/make-dependencies.js";
import { makeGetAvailabilityService } from "./infra/factories/make-get-availability-service.js";
import { makeGetReservationService } from "./infra/factories/make-get-reservation-service.js";
import { makeListTablesService } from "./infra/factories/make-list-tables-service.js";
import { createBullBoardRoutes } from "./infra/http/bull-board.routes.js";
import { errorHandler } from "./infra/http/errors/error-handler.js";
import { createReservationRoutes } from "./infra/http/reservation.routes.js";
import { createTableRoutes } from "./infra/http/table.routes.js";

const dependencies = makeDependencies();

const listTablesService = makeListTablesService(dependencies);
const getAvailabilityService = makeGetAvailabilityService(dependencies);
const createReservationService = makeCreateReservationService(dependencies);
const getReservationService = makeGetReservationService(dependencies);

export const app = new Hono();

app.route("/tables", createTableRoutes(listTablesService, getAvailabilityService));
app.route(
  "/reservations",
  createReservationRoutes(createReservationService, getReservationService),
);
app.route(env.BULL_BOARD_BASE_PATH, createBullBoardRoutes());

app.onError(errorHandler);
