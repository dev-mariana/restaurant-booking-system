import { createRoute, type RouteHandler, type z } from "@hono/zod-openapi";
import { ReservationResponseDTO } from "../../../../application/reservation/schemas/reservation-response.dto.js";
import type { CancelReservationService } from "../../../../application/reservation/services/cancel-reservation.service.js";
import {
  errorResponseSchema,
  idParamSchema,
  reservationSchema,
} from "../../openapi/schemas.js";

export const cancelReservationRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Reservations"],
  summary: "Cancel a reservation (invalidates the availability cache)",
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      content: { "application/json": { schema: reservationSchema } },
      description: "The cancelled reservation",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Reservation not found",
    },
    409: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Reservation is already rejected or cancelled",
    },
  },
});

export function cancelReservationController(
  cancelReservationService: CancelReservationService,
): RouteHandler<typeof cancelReservationRoute> {
  return async (c) => {
    const { id } = c.req.valid("param");

    const reservation = await cancelReservationService.execute(id);

    return c.json(
      new ReservationResponseDTO(reservation) as unknown as z.infer<
        typeof reservationSchema
      >,
      200,
    );
  };
}
