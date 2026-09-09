import { Hono } from "hono";
import type { CreateReservationService } from "../../application/reservation/services/create-reservation.service.js";
import type { GetReservationService } from "../../application/reservation/services/get-reservation.service.js";
import type { ListReservationsByEmailService } from "../../application/reservation/services/list-reservations-by-email.service.js";
import { createReservationController } from "./controllers/reservation/create-reservation.controller.js";
import { findReservationController } from "./controllers/reservation/find-reservation.controller.js";
import { listReservationsByEmailController } from "./controllers/reservation/list-reservations-by-email.controller.js";

export function createReservationRoutes(
  createReservationService: CreateReservationService,
  getReservationService: GetReservationService,
  listReservationsByEmailService: ListReservationsByEmailService,
): Hono {
  const routes = new Hono();

  routes.post("/", createReservationController(createReservationService));
  routes.get("/", listReservationsByEmailController(listReservationsByEmailService));
  routes.get("/:id", findReservationController(getReservationService));

  return routes;
}
