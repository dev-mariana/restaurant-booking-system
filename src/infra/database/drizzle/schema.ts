import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "../../../common/helpers/generate-id.js";

export const reservationStatusEnum = pgEnum("reservation_status", [
  "Pending",
  "Confirmed",
  "Rejected",
  "Cancelled",
]);

export const tables = pgTable("tables", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const reservations = pgTable("reservations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  tableId: text("table_id")
    .notNull()
    .references(() => tables.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  slotStart: timestamp("slot_start").notNull(),
  slotEnd: timestamp("slot_end").notNull(),
  status: reservationStatusEnum("status").notNull().default("Pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
