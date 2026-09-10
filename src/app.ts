import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { env } from "./infra/env/env.js";
import { makeCancelReservationService } from "./infra/factories/make-cancel-reservation-service.js";
import { makeCreateReservationService } from "./infra/factories/make-create-reservation-service.js";
import type { Dependencies } from "./infra/factories/make-dependencies.js";
import { makeDependencies } from "./infra/factories/make-dependencies.js";
import { makeGetAvailabilityService } from "./infra/factories/make-get-availability-service.js";
import { makeGetReservationService } from "./infra/factories/make-get-reservation-service.js";
import { makeListReservationsByEmailService } from "./infra/factories/make-list-reservations-by-email-service.js";
import { makeListTablesService } from "./infra/factories/make-list-tables-service.js";
import { createBullBoardRoutes } from "./infra/http/bull-board.routes.js";
import { errorHandler } from "./infra/http/errors/error-handler.js";
import { httpLogger } from "./infra/http/middlewares/http-logger.js";
import { createReservationRoutes } from "./infra/http/reservation.routes.js";
import { createTableRoutes } from "./infra/http/table.routes.js";

export function createApp(dependencies: Dependencies): OpenAPIHono {
  const listTablesService = makeListTablesService(dependencies);
  const getAvailabilityService = makeGetAvailabilityService(dependencies);
  const createReservationService = makeCreateReservationService(dependencies);
  const getReservationService = makeGetReservationService(dependencies);
  const listReservationsByEmailService = makeListReservationsByEmailService(dependencies);
  const cancelReservationService = makeCancelReservationService(dependencies);

  const app = new OpenAPIHono();

  app.use(httpLogger);

  app.route("/tables", createTableRoutes(listTablesService, getAvailabilityService));
  app.route(
    "/reservations",
    createReservationRoutes(
      createReservationService,
      getReservationService,
      listReservationsByEmailService,
      cancelReservationService,
    ),
  );

  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "Sistema de Reservas de Mesas",
      version: "1.0.0",
      description:
        "Backend de estudo aplicado (system design): cache, fila e arquitetura hexagonal.",
    },
  });
  app.get("/docs", Scalar({ url: "/openapi.json" }));

  app.onError(errorHandler);

  return app;
}

export const app = createApp(makeDependencies());

app.route(env.BULL_BOARD_BASE_PATH, createBullBoardRoutes());
