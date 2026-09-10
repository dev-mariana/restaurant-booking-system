import { z } from "@hono/zod-openapi";
import { ReservationStatus } from "../../../domain/reservation/reservation.entity.js";

export const idParamSchema = z.object({
  id: z
    .string()
    .min(1)
    .openapi({ param: { name: "id", in: "path" }, example: "n3a5q8s1oo5t4mzg" }),
});

export const tableSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    capacity: z.number().int(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .openapi("Table");

export const availabilitySlotSchema = z
  .object({
    start: z.iso.datetime(),
    end: z.iso.datetime(),
    available: z.boolean(),
  })
  .openapi("AvailabilitySlot");

export const reservationSchema = z
  .object({
    id: z.string(),
    table_id: z.string(),
    customer_name: z.string(),
    customer_email: z.email(),
    slot_start: z.iso.datetime(),
    slot_end: z.iso.datetime(),
    status: z.enum(ReservationStatus),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
  })
  .openapi("Reservation");

export const badRequestResponseSchema = z
  .object({
    message: z.string(),
    details: z
      .array(
        z.object({
          field: z.string(),
          message: z.string(),
        }),
      )
      .optional(),
  })
  .openapi("BadRequestResponse");

export const errorResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi("ErrorResponse");
