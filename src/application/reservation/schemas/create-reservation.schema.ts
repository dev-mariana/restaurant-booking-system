import { z } from "zod";

export const createReservationSchema = z
  .object({
    table_id: z.string().min(1),
    customer_name: z.string().min(1),
    customer_email: z.email(),
    slot_start: z.coerce.date(),
    slot_end: z.coerce.date(),
  })
  .refine((data) => data.slot_end > data.slot_start, {
    message: "slot_end must be after slot_start",
    path: ["slot_end"],
  })
  .transform((data) => ({
    tableId: data.table_id,
    customerName: data.customer_name,
    customerEmail: data.customer_email,
    slotStart: data.slot_start,
    slotEnd: data.slot_end,
  }));

export type CreateReservationDTO = z.infer<typeof createReservationSchema>;
