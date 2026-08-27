import type { Context } from "hono";
import { describe, expect, it, vi } from "vitest";
import { BadRequestError } from "../../../common/errors/bad-request-error.js";
import { ConflictError } from "../../../common/errors/conflict-error.js";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { errorHandler } from "./error-handler.js";

function makeContext() {
  const json = vi.fn();

  return { json } as unknown as Context;
}

describe("errorHandler", () => {
  it("maps NotFoundError to 404", () => {
    const c = makeContext();
    const error = new NotFoundError("Table table-1 not found.");

    errorHandler(error, c);

    expect(c.json).toHaveBeenCalledWith({ message: error.message }, 404);
  });

  it("maps ConflictError to 409", () => {
    const c = makeContext();
    const error = new ConflictError("Reservation cannot be cancelled from status confirmed.");

    errorHandler(error, c);

    expect(c.json).toHaveBeenCalledWith({ message: error.message }, 409);
  });

  it("maps BadRequestError to 400", () => {
    const c = makeContext();
    const error = new BadRequestError("slot_end must be after slot_start");

    errorHandler(error, c);

    expect(c.json).toHaveBeenCalledWith({ message: error.message }, 400);
  });

  it("maps unmapped errors to 500 without leaking the original message", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const c = makeContext();
    const error = new Error("unexpected failure");

    errorHandler(error, c);

    expect(c.json).toHaveBeenCalledWith({ message: "Internal server error" }, 500);

    vi.restoreAllMocks();
  });
});
