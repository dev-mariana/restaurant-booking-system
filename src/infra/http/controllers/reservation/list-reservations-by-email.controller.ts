import { createRoute, type RouteHandler, z } from "@hono/zod-openapi";
import { ReservationResponseDTO } from "../../../../application/reservation/schemas/reservation-response.dto.js";
import type { ListReservationsByEmailService } from "../../../../application/reservation/services/list-reservations-by-email.service.js";
import { reservationSchema } from "../../openapi/schemas.js";

const listReservationsQuerySchema = z.object({
  email: z.email().openapi({
    param: { name: "email", in: "query" },
    example: "ana@example.com",
  }),
});

export const listReservationsByEmailRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Reservations"],
  summary: "List a customer's reservations by email",
  request: {
    query: listReservationsQuerySchema,
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.array(reservationSchema) } },
      description: "The customer's reservations",
    },
  },
});

export function listReservationsByEmailController(
  listReservationsByEmailService: ListReservationsByEmailService,
): RouteHandler<typeof listReservationsByEmailRoute> {
  return async (c) => {
    const { email } = c.req.valid("query");

    const reservations = await listReservationsByEmailService.execute(email);

    return c.json(
      reservations.map(
        (reservation) => new ReservationResponseDTO(reservation),
      ) as unknown as z.infer<typeof reservationSchema>[],
    );
  };
}
