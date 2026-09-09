import type { Context } from "hono";
import { z } from "zod";
import { ReservationResponseDTO } from "../../../../application/reservation/schemas/reservation-response.dto.js";
import type { ListReservationsByEmailService } from "../../../../application/reservation/services/list-reservations-by-email.service.js";
import { BadRequestError } from "../../../../common/errors/bad-request-error.js";
import { formatZodError } from "../../../../common/helpers/format-zod-error.js";

const listReservationsQuerySchema = z.object({
  email: z.email(),
});

export function listReservationsByEmailController(
  listReservationsByEmailService: ListReservationsByEmailService,
) {
  return async (c: Context) => {
    const parsed = listReservationsQuerySchema.safeParse(c.req.query());

    if (!parsed.success) {
      throw new BadRequestError("Invalid query parameters", formatZodError(parsed.error));
    }

    const reservations = await listReservationsByEmailService.execute(parsed.data.email);

    return c.json(reservations.map((reservation) => new ReservationResponseDTO(reservation)));
  };
}
