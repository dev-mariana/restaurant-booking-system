import type { z } from "zod";
import type { BadRequestErrorDetail } from "../errors/bad-request-error.js";

export function formatZodError(error: z.ZodError): BadRequestErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}
