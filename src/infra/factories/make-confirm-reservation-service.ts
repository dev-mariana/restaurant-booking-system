import { ConfirmReservationService } from "../../application/reservation/services/confirm-reservation.service.js";
import type { Dependencies } from "./make-dependencies.js";

export function makeConfirmReservationService(
  dependencies: Dependencies,
): ConfirmReservationService {
  return new ConfirmReservationService(
    dependencies.reservationRepository,
    dependencies.cacheRepository,
  );
}
