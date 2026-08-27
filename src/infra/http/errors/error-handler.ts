import type { Context } from "hono";
import { BadRequestError } from "../../../common/errors/bad-request-error.js";
import { ConflictError } from "../../../common/errors/conflict-error.js";
import { NotFoundError } from "../../../common/errors/not-found-error.js";

export function errorHandler(err: Error, c: Context): Response {
  if (err instanceof NotFoundError) {
    return c.json({ message: err.message }, 404);
  }

  if (err instanceof ConflictError) {
    return c.json({ message: err.message }, 409);
  }

  if (err instanceof BadRequestError) {
    return c.json({ message: err.message }, 400);
  }

  console.error(err);

  return c.json({ message: "Internal server error" }, 500);
}
