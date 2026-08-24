export interface IReservationQueue {
  enqueueConfirmation(reservationId: string, tableId: string): Promise<void>;
}
