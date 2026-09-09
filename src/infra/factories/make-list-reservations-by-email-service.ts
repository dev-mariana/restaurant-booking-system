import { ListReservationsByEmailService } from "../../application/reservation/services/list-reservations-by-email.service.js";
import type { Dependencies } from "./make-dependencies.js";

export function makeListReservationsByEmailService(
  dependencies: Dependencies,
): ListReservationsByEmailService {
  return new ListReservationsByEmailService(dependencies.reservationRepository);
}
