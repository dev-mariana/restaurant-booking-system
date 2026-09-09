import { Hono } from "hono";
import type { CreateReservationService } from "../../application/reservation/services/create-reservation.service.js";
import { createReservationController } from "./controllers/reservation/create-reservation.controller.js";

export function createReservationRoutes(createReservationService: CreateReservationService): Hono {
  const routes = new Hono();

  routes.post("/", createReservationController(createReservationService));

  return routes;
}
