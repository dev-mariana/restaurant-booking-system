import type { Context } from "hono";
import { ReservationResponseDTO } from "../../../../application/reservation/schemas/reservation-response.dto.js";
import type { CancelReservationService } from "../../../../application/reservation/services/cancel-reservation.service.js";

export function cancelReservationController(cancelReservationService: CancelReservationService) {
  return async (c: Context) => {
    const { id } = c.req.param();

    const reservation = await cancelReservationService.execute(id);

    return c.json(new ReservationResponseDTO(reservation));
  };
}
