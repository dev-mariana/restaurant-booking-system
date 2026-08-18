export class Reservation {
  id: string;
  tableId: string;
  customerName: string;
  customerEmail: string;
  slotStart: Date;
  slotEnd: Date;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReservationStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  REJECTED = "Rejected",
  CANCELLED = "Cancelled",
}
