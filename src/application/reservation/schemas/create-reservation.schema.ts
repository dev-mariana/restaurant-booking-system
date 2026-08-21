import { z } from "zod";

export const createReservationSchema = z
  .object({
    tableId: z.string().min(1),
    customerName: z.string().min(1),
    customerEmail: z.email(),
    slotStart: z.coerce.date(),
    slotEnd: z.coerce.date(),
  })
  .refine((data) => data.slotEnd > data.slotStart, {
    message: "slot_end must be after slot_start",
    path: ["slotEnd"],
  });

export type CreateReservationDTO = z.infer<typeof createReservationSchema>;
