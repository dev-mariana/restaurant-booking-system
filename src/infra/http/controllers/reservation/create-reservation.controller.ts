import type { Context } from "hono";
import { createReservationSchema } from "../../../../application/reservation/schemas/create-reservation.schema.js";
import { ReservationResponseDTO } from "../../../../application/reservation/schemas/reservation-response.dto.js";
import type { CreateReservationService } from "../../../../application/reservation/services/create-reservation.service.js";
import { BadRequestError } from "../../../../common/errors/bad-request-error.js";
import { formatZodError } from "../../../../common/helpers/format-zod-error.js";

export function createReservationController(createReservationService: CreateReservationService) {
  return async (c: Context) => {
    const body = await c.req.json();

    const parsed = createReservationSchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestError("Invalid request body", formatZodError(parsed.error));
    }

    const reservation = await createReservationService.execute(parsed.data);

    return c.json(new ReservationResponseDTO(reservation), 202);
  };
}
