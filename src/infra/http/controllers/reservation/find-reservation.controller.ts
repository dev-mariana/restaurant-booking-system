import type { Context } from "hono";
import { ReservationResponseDTO } from "../../../../application/reservation/schemas/reservation-response.dto.js";
import type { GetReservationService } from "../../../../application/reservation/services/get-reservation.service.js";

export function findReservationController(getReservationService: GetReservationService) {
  return async (c: Context) => {
    const { id } = c.req.param();

    const reservation = await getReservationService.execute(id);

    return c.json(new ReservationResponseDTO(reservation));
  };
}
