import { createRoute, type RouteHandler, z } from "@hono/zod-openapi";
import type { GetAvailabilityService } from "../../../../application/table/services/get-availability.service.js";
import {
  availabilitySlotSchema,
  badRequestResponseSchema,
  errorResponseSchema,
  idParamSchema,
} from "../../openapi/schemas.js";

const availabilityQuerySchema = z.object({
  date: z.coerce
    .date()
    .openapi({ param: { name: "date", in: "query" }, example: "2026-09-15" }),
});

export const findTableAvailabilityRoute = createRoute({
  method: "get",
  path: "/{id}/availability",
  tags: ["Tables"],
  summary: "Get a table's availability for a given day (cache-aside)",
  request: {
    params: idParamSchema,
    query: availabilityQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": { schema: z.array(availabilitySlotSchema) },
      },
      description: "Hourly slots for the requested day",
    },
    400: {
      content: { "application/json": { schema: badRequestResponseSchema } },
      description: "Invalid id or date",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Table not found",
    },
  },
});

export function findTableAvailabilityController(
  getAvailabilityService: GetAvailabilityService,
): RouteHandler<typeof findTableAvailabilityRoute> {
  return async (c) => {
    const { id } = c.req.valid("param");
    const { date } = c.req.valid("query");

    const slots = await getAvailabilityService.execute(id, date);

    return c.json(
      slots as unknown as z.infer<typeof availabilitySlotSchema>[],
      200,
    );
  };
}
