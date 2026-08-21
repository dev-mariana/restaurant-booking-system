import { Hono } from "hono";
import type { GetAvailabilityService } from "../../application/table/services/get-availability.service.js";
import type { ListTablesService } from "../../application/table/services/list-tables.service.js";
import { findTableAvailabilityController } from "./controllers/table/find-table-availability.controller.js";
import { findTablesController } from "./controllers/table/find-tables.controller.js";

export function createTableRoutes(
  listTablesService: ListTablesService,
  getAvailabilityService: GetAvailabilityService,
): Hono {
  const routes = new Hono();

  routes.get("/", findTablesController(listTablesService));
  routes.get("/:id/availability", findTableAvailabilityController(getAvailabilityService));

  return routes;
}
