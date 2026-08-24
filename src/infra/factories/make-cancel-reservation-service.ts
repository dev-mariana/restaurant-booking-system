import { CancelReservationService } from "../../application/reservation/services/cancel-reservation.service.js";
import type { Dependencies } from "./make-dependencies.js";

export function makeCancelReservationService(dependencies: Dependencies): CancelReservationService {
  return new CancelReservationService(
    dependencies.reservationRepository,
    dependencies.cacheRepository,
  );
}
