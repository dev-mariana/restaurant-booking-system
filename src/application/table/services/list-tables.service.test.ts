import { describe, expect, it } from "vitest";
import { createId } from "../../../common/generate-id.js";
import { Table } from "../../../domain/table/table.entity.js";
import type { ITableRepository } from "../../../domain/table/table.repository.js";
import { ListTablesService } from "./list-tables.service.js";

function makeTable(overrides: Partial<Table> = {}): Table {
  return Object.assign(new Table(), {
    id: createId(),
    name: "Mesa 1",
    capacity: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

class FakeTableRepository implements ITableRepository {
  constructor(private readonly tables: Table[]) {}

  async findAll(): Promise<Table[]> {
    return this.tables;
  }

  async findById(id: string): Promise<Table | null> {
    return this.tables.find((table) => table.id === id) ?? null;
  }
}

describe("ListTablesService", () => {
  it("returns all tables from the repository", async () => {
    const tables = [makeTable(), makeTable()];
    const service = new ListTablesService(new FakeTableRepository(tables));

    const result = await service.execute();

    expect(result).toEqual(tables);
  });

  it("returns an empty list when there are no tables", async () => {
    const service = new ListTablesService(new FakeTableRepository([]));

    const result = await service.execute();

    expect(result).toEqual([]);
  });
});
