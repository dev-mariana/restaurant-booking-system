import { OpenAPIHono } from "@hono/zod-openapi";
import type { CancelReservationService } from "../../application/reservation/services/cancel-reservation.service.js";
import type { CreateReservationService } from "../../application/reservation/services/create-reservation.service.js";
import type { GetReservationService } from "../../application/reservation/services/get-reservation.service.js";
import type { ListReservationsByEmailService } from "../../application/reservation/services/list-reservations-by-email.service.js";
import {
  cancelReservationController,
  cancelReservationRoute,
} from "./controllers/reservation/cancel-reservation.controller.js";
import {
  createReservationController,
  createReservationRoute,
} from "./controllers/reservation/create-reservation.controller.js";
import {
  findReservationController,
  findReservationRoute,
} from "./controllers/reservation/find-reservation.controller.js";
import {
  listReservationsByEmailController,
  listReservationsByEmailRoute,
} from "./controllers/reservation/list-reservations-by-email.controller.js";
import { validationHook } from "./openapi/validation-hook.js";

export function createReservationRoutes(
  createReservationService: CreateReservationService,
  getReservationService: GetReservationService,
  listReservationsByEmailService: ListReservationsByEmailService,
  cancelReservationService: CancelReservationService,
): OpenAPIHono {
  const routes = new OpenAPIHono({ defaultHook: validationHook });

  routes.openapi(createReservationRoute, createReservationController(createReservationService));
  routes.openapi(
    listReservationsByEmailRoute,
    listReservationsByEmailController(listReservationsByEmailService),
  );
  routes.openapi(findReservationRoute, findReservationController(getReservationService));
  routes.openapi(cancelReservationRoute, cancelReservationController(cancelReservationService));

  return routes;
}
