import { eq } from "drizzle-orm";
import type { Table } from "../../../../domain/table/table.entity.js";
import type { ITableRepository } from "../../../../domain/table/table.repository.js";
import { db } from "../config.js";
import { TableMapper } from "../mappers/table.mapper.js";
import { tables } from "../schema.js";

export class TableRepository implements ITableRepository {
  async findAll(): Promise<Table[]> {
    const rows = await db.select().from(tables);

    return rows.map(TableMapper.toDomain);
  }

  async findById(id: string): Promise<Table | null> {
    const [row] = await db.select().from(tables).where(eq(tables.id, id));

    return row ? TableMapper.toDomain(row) : null;
  }
}
