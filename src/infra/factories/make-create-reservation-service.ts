import { CreateReservationService } from "../../application/reservation/services/create-reservation.service.js";
import type { Dependencies } from "./make-dependencies.js";

export function makeCreateReservationService(dependencies: Dependencies): CreateReservationService {
  return new CreateReservationService(
    dependencies.tableRepository,
    dependencies.reservationRepository,
    dependencies.reservationQueue,
    dependencies.logger,
  );
}
