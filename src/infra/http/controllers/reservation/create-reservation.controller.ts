import { createRoute, type RouteHandler, type z } from "@hono/zod-openapi";
import { createReservationSchema } from "../../../../application/reservation/schemas/create-reservation.schema.js";
import { ReservationResponseDTO } from "../../../../application/reservation/schemas/reservation-response.dto.js";
import type { CreateReservationService } from "../../../../application/reservation/services/create-reservation.service.js";
import { badRequestResponseSchema, reservationSchema } from "../../openapi/schemas.js";

export const createReservationRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Reservations"],
  summary: "Request a reservation (always created as pending, confirmed asynchronously)",
  request: {
    body: {
      content: { "application/json": { schema: createReservationSchema } },
    },
  },
  responses: {
    202: {
      content: { "application/json": { schema: reservationSchema } },
      description: "Reservation accepted and queued for confirmation",
    },
    400: {
      content: { "application/json": { schema: badRequestResponseSchema } },
      description: "Invalid request body",
    },
  },
});

export function createReservationController(
  createReservationService: CreateReservationService,
): RouteHandler<typeof createReservationRoute> {
  return async (c) => {
    const data = c.req.valid("json");

    const reservation = await createReservationService.execute(data);

    return c.json(
      new ReservationResponseDTO(reservation) as unknown as z.infer<typeof reservationSchema>,
      202,
    );
  };
}
