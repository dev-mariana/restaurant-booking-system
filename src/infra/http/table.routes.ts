import { OpenAPIHono } from "@hono/zod-openapi";
import type { GetAvailabilityService } from "../../application/table/services/get-availability.service.js";
import type { ListTablesService } from "../../application/table/services/list-tables.service.js";
import {
  findTableAvailabilityController,
  findTableAvailabilityRoute,
} from "./controllers/table/find-table-availability.controller.js";
import {
  findTablesController,
  findTablesRoute,
} from "./controllers/table/find-tables.controller.js";
import { validationHook } from "./openapi/validation-hook.js";

export function createTableRoutes(
  listTablesService: ListTablesService,
  getAvailabilityService: GetAvailabilityService,
): OpenAPIHono {
  const routes = new OpenAPIHono({ defaultHook: validationHook });

  routes.openapi(findTablesRoute, findTablesController(listTablesService));
  routes.openapi(
    findTableAvailabilityRoute,
    findTableAvailabilityController(getAvailabilityService),
  );

  return routes;
}
