import { Hono } from "hono";
import { NotFoundError } from "./common/errors/not-found-error.js";
import { makeDependencies } from "./infra/factories/make-dependencies.js";
import { makeGetAvailabilityService } from "./infra/factories/make-get-availability-service.js";
import { makeListTablesService } from "./infra/factories/make-list-tables-service.js";
import { createTableRoutes } from "./infra/http/table.routes.js";

const dependencies = makeDependencies();

const listTablesService = makeListTablesService(dependencies);
const getAvailabilityService = makeGetAvailabilityService(dependencies);

export const app = new Hono();

app.route("/tables", createTableRoutes(listTablesService, getAvailabilityService));

app.onError((err, c) => {
  if (err instanceof NotFoundError) {
    return c.json({ message: err.message }, 404);
  }

  console.error(err);

  return c.json({ message: "Internal server error" }, 500);
});
