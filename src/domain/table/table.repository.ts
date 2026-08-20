import type { Table } from "./table.entity.js";

export interface ITableRepository {
  findAll(): Promise<Table[]>;
  findById(id: string): Promise<Table | null>;
}
