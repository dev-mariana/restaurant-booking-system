import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { createId } from "../../../common/generate-id.js";
import { createTimeSlot } from "../../../common/time-slot.js";
import type { IReservationQueue } from "../../../domain/queue/reservation-queue.js";
import type { Reservation } from "../../../domain/reservation/reservation.entity.js";
import { ReservationStatus } from "../../../domain/reservation/reservation.entity.js";
import type { IReservationRepository } from "../../../domain/reservation/reservation.repository.js";
import type { ITableRepository } from "../../../domain/table/table.repository.js";
import type { CreateReservationDTO } from "../schemas/create-reservation.schema.js";

export class CreateReservationService {
  constructor(
    private readonly tableRepository: ITableRepository,
    private readonly reservationRepository: IReservationRepository,
    private readonly reservationQueue: IReservationQueue,
  ) {}

  async execute(dto: CreateReservationDTO): Promise<Reservation> {
    const table = await this.tableRepository.findById(dto.tableId);

    if (!table) {
      throw new NotFoundError(`Table ${dto.tableId} not found.`);
    }

    createTimeSlot(dto.slotStart, dto.slotEnd);

    const reservation: Omit<Reservation, "createdAt" | "updatedAt"> = {
      id: createId(),
      tableId: dto.tableId,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      slotStart: dto.slotStart,
      slotEnd: dto.slotEnd,
      status: ReservationStatus.Pending,
    };

    const created = await this.reservationRepository.create(reservation);

    await this.reservationQueue.enqueueConfirmation(created.id, created.tableId);

    return created;
  }
}
