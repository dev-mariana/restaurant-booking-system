import type { Context } from "hono";
import type { ListTablesService } from "../../../../application/table/services/list-tables.service.js";

export function findTablesController(listTablesService: ListTablesService) {
  return async (c: Context) => {
    const tables = await listTablesService.execute();

    return c.json(tables);
  };
}
