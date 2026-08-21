import { ListTablesService } from "../../application/table/services/list-tables.service.js";
import type { Dependencies } from "./make-dependencies.js";

export function makeListTablesService(dependencies: Dependencies): ListTablesService {
  return new ListTablesService(dependencies.tableRepository);
}
