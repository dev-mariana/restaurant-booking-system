import { GetReservationService } from "../../application/reservation/services/get-reservation.service.js";
import type { Dependencies } from "./make-dependencies.js";

export function makeGetReservationService(dependencies: Dependencies): GetReservationService {
  return new GetReservationService(dependencies.reservationRepository, dependencies.logger);
}
