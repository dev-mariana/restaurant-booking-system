import type { Reservation } from "../../../domain/reservation/reservation.entity.js";

export class ReservationResponseDTO {
  id: string;
  table_id: string;
  customer_name: string;
  customer_email: string;
  slot_start: Date;
  slot_end: Date;
  status: string;
  created_at: Date;
  updated_at: Date;

  constructor(reservation: Reservation) {
    this.id = reservation.id;
    this.table_id = reservation.tableId;
    this.customer_name = reservation.customerName;
    this.customer_email = reservation.customerEmail;
    this.slot_start = reservation.slotStart;
    this.slot_end = reservation.slotEnd;
    this.status = reservation.status;
    this.created_at = reservation.createdAt;
    this.updated_at = reservation.updatedAt;
  }
}
