import { GetAvailabilityService } from "../../application/table/services/get-availability.service.js";
import type { Dependencies } from "./make-dependencies.js";

export function makeGetAvailabilityService(dependencies: Dependencies): GetAvailabilityService {
  return new GetAvailabilityService(
    dependencies.tableRepository,
    dependencies.reservationRepository,
    dependencies.cacheRepository,
  );
}
