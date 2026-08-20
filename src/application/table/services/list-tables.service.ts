import type { Table } from "../../../domain/table/table.entity.js";
import type { ITableRepository } from "../../../domain/table/table.repository.js";

export class ListTablesService {
  constructor(private readonly tableRepository: ITableRepository) {}

  async execute(): Promise<Table[]> {
    return this.tableRepository.findAll();
  }
}
