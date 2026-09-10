import { createRoute, type RouteHandler, type z } from "@hono/zod-openapi";
import { ReservationResponseDTO } from "../../../../application/reservation/schemas/reservation-response.dto.js";
import type { GetReservationService } from "../../../../application/reservation/services/get-reservation.service.js";
import {
  errorResponseSchema,
  idParamSchema,
  reservationSchema,
} from "../../openapi/schemas.js";

export const findReservationRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Reservations"],
  summary: "Get a reservation's current status (polling)",
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      content: { "application/json": { schema: reservationSchema } },
      description: "The reservation",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Reservation not found",
    },
  },
});

export function findReservationController(
  getReservationService: GetReservationService,
): RouteHandler<typeof findReservationRoute> {
  return async (c) => {
    const { id } = c.req.valid("param");

    const reservation = await getReservationService.execute(id);

    return c.json(
      new ReservationResponseDTO(reservation) as unknown as z.infer<
        typeof reservationSchema
      >,
      200,
    );
  };
}
