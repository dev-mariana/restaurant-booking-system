import type { Context } from "hono";
import { z } from "zod";
import type { GetAvailabilityService } from "../../../../application/table/services/get-availability.service.js";

const availabilityQuerySchema = z.object({
  date: z.coerce.date(),
});

export function findTableAvailabilityController(getAvailabilityService: GetAvailabilityService) {
  return async (c: Context) => {
    const { id } = c.req.param();

    const parsed = availabilityQuerySchema.safeParse(c.req.query());
    if (!parsed.success) {
      return c.json({ message: "Invalid query parameters" }, 400);
    }

    const slots = await getAvailabilityService.execute(id, parsed.data.date);

    return c.json(slots);
  };
}
