import { createRoute, type RouteHandler, z } from "@hono/zod-openapi";
import type { ListTablesService } from "../../../../application/table/services/list-tables.service.js";
import { tableSchema } from "../../openapi/schemas.js";

export const findTablesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Tables"],
  summary: "List the restaurant's tables",
  responses: {
    200: {
      content: { "application/json": { schema: z.array(tableSchema) } },
      description: "The list of tables",
    },
  },
});

export function findTablesController(
  listTablesService: ListTablesService,
): RouteHandler<typeof findTablesRoute> {
  return async (c) => {
    const tables = await listTablesService.execute();

    return c.json(tables as unknown as z.infer<typeof tableSchema>[]);
  };
}
