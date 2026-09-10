import { type ILogger, noopLogger } from "../../../domain/logger/logger.js";
import type { Table } from "../../../domain/table/table.entity.js";
import type { ITableRepository } from "../../../domain/table/table.repository.js";

export class ListTablesService {
  constructor(
    private readonly tableRepository: ITableRepository,
    private readonly logger: ILogger = noopLogger,
  ) {}

  async execute(): Promise<Table[]> {
    const tables = await this.tableRepository.findAll();

    this.logger.info({ count: tables.length }, "Listed tables");

    return tables;
  }
}
