import type { Table } from "./table.entity.js";

export interface TableRepository {
  findAll(): Promise<Table[]>;
  findById(id: string): Promise<Table | null>;
}
