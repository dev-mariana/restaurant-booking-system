import type { Context } from "hono";
import type { z } from "zod";
import { BadRequestError } from "../../../common/errors/bad-request-error.js";
import { formatZodError } from "../../../common/helpers/format-zod-error.js";

type ValidationResult = { success: true; data: unknown } | { success: false; error: z.ZodError };

export function validationHook(result: ValidationResult, _c: Context): void {
  if (!result.success) {
    throw new BadRequestError("Invalid request", formatZodError(result.error));
  }
}
