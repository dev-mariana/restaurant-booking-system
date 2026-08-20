import type { Table } from "../../../../domain/table/table.entity.js";
import type { tables } from "../schema.js";

type TableRow = typeof tables.$inferSelect;

// biome-ignore lint/complexity/noStaticOnlyClass: mapper follows a static-only class convention
export class TableMapper {
  static toDomain(raw: TableRow): Table {
    return {
      id: raw.id,
      name: raw.name,
      capacity: raw.capacity,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
