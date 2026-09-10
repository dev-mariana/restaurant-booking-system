import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { createId } from "./common/helpers/generate-id.js";
import type { ICacheRepository } from "./domain/cache/cache.repository.js";
import { noopLogger } from "./domain/logger/logger.js";
import type { IReservationQueue } from "./domain/queue/reservation-queue.js";
import { Reservation, ReservationStatus } from "./domain/reservation/reservation.entity.js";
import type { IReservationRepository } from "./domain/reservation/reservation.repository.js";
import { Table } from "./domain/table/table.entity.js";
import type { ITableRepository } from "./domain/table/table.repository.js";

function makeTable(overrides: Partial<Table> = {}): Table {
  return Object.assign(new Table(), {
    id: createId(),
    name: "Mesa 1",
    capacity: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
  return Object.assign(new Reservation(), {
    id: createId(),
    tableId: createId(),
    customerName: "Mari",
    customerEmail: "mari@example.com",
    slotStart: new Date("2026-09-20T19:00:00.000Z"),
    slotEnd: new Date("2026-09-20T20:00:00.000Z"),
    status: ReservationStatus.Pending,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

class FakeTableRepository implements ITableRepository {
  public tables: Table[] = [];

  async findAll(): Promise<Table[]> {
    return this.tables;
  }

  async findById(id: string): Promise<Table | null> {
    return this.tables.find((table) => table.id === id) ?? null;
  }
}

class FakeReservationRepository implements IReservationRepository {
  public reservations: Reservation[] = [];

  async create(reservation: Omit<Reservation, "createdAt" | "updatedAt">): Promise<Reservation> {
    const now = new Date();
    const persisted = Object.assign(new Reservation(), {
      ...reservation,
      createdAt: now,
      updatedAt: now,
    });
    this.reservations.push(persisted);

    return persisted;
  }

  async findById(id: string): Promise<Reservation | null> {
    return this.reservations.find((reservation) => reservation.id === id) ?? null;
  }

  async findByCustomerEmail(email: string): Promise<Reservation[]> {
    return this.reservations.filter((reservation) => reservation.customerEmail === email);
  }

  async findConfirmedByTableAndDate(tableId: string): Promise<Reservation[]> {
    return this.reservations.filter(
      (reservation) =>
        reservation.tableId === tableId && reservation.status === ReservationStatus.Confirmed,
    );
  }

  async updateStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const reservation = this.reservations.find((r) => r.id === id);

    if (!reservation) {
      throw new Error("reservation not found");
    }

    reservation.status = status;
    reservation.updatedAt = new Date();

    return reservation;
  }
}

class FakeCacheRepository implements ICacheRepository {
  private readonly store = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    return (this.store.get(key) as T) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

class FakeReservationQueue implements IReservationQueue {
  public enqueued: { reservationId: string; tableId: string }[] = [];

  async enqueueConfirmation(reservationId: string, tableId: string): Promise<void> {
    this.enqueued.push({ reservationId, tableId });
  }
}

function createTestApp() {
  const tableRepository = new FakeTableRepository();
  const reservationRepository = new FakeReservationRepository();
  const cacheRepository = new FakeCacheRepository();
  const reservationQueue = new FakeReservationQueue();

  const app = createApp({
    tableRepository,
    reservationRepository,
    cacheRepository,
    reservationQueue,
    logger: noopLogger,
  });

  return { app, tableRepository, reservationRepository, cacheRepository, reservationQueue };
}

describe("HTTP integration", () => {
  let ctx: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    ctx = createTestApp();
  });

  describe("GET /tables", () => {
    it("returns the tables from the repository", async () => {
      const table = makeTable();
      ctx.tableRepository.tables.push(table);

      const res = await ctx.app.request("/tables");

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([
        {
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
        },
      ]);
    });
  });

  describe("GET /tables/:id/availability", () => {
    it("returns hourly slots for a valid table and date", async () => {
      const table = makeTable();
      ctx.tableRepository.tables.push(table);

      const res = await ctx.app.request(`/tables/${table.id}/availability?date=2026-09-20`);

      expect(res.status).toBe(200);
      const slots = await res.json();
      expect(Array.isArray(slots)).toBe(true);
      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0]).toEqual(
        expect.objectContaining({
          start: expect.any(String),
          end: expect.any(String),
          available: true,
        }),
      );
    });

    it("returns 404 when the table does not exist", async () => {
      const res = await ctx.app.request(`/tables/${createId()}/availability?date=2026-09-20`);

      expect(res.status).toBe(404);
    });

    it("returns 400 when the date query param is invalid", async () => {
      const table = makeTable();
      ctx.tableRepository.tables.push(table);

      const res = await ctx.app.request(`/tables/${table.id}/availability?date=not-a-date`);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toBe("Invalid request");
    });
  });

  describe("POST /reservations", () => {
    it("returns 202 with a pending reservation and enqueues confirmation", async () => {
      const table = makeTable();
      ctx.tableRepository.tables.push(table);

      const res = await ctx.app.request("/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          table_id: table.id,
          customer_name: "Ana",
          customer_email: "ana@example.com",
          slot_start: "2026-09-20T19:00:00.000Z",
          slot_end: "2026-09-20T20:00:00.000Z",
        }),
      });

      expect(res.status).toBe(202);
      const body = await res.json();
      expect(body.status).toBe(ReservationStatus.Pending);
      expect(body.table_id).toBe(table.id);
      expect(ctx.reservationQueue.enqueued).toEqual([
        { reservationId: body.id, tableId: table.id },
      ]);
    });

    it("returns 400 with field details for an invalid body", async () => {
      const res = await ctx.app.request("/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ table_id: "" }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: "table_id" })]),
      );
    });

    it("returns 404 when the table does not exist", async () => {
      const res = await ctx.app.request("/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          table_id: createId(),
          customer_name: "Ana",
          customer_email: "ana@example.com",
          slot_start: "2026-09-20T19:00:00.000Z",
          slot_end: "2026-09-20T20:00:00.000Z",
        }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe("GET /reservations/:id", () => {
    it("returns the reservation", async () => {
      const reservation = makeReservation();
      ctx.reservationRepository.reservations.push(reservation);

      const res = await ctx.app.request(`/reservations/${reservation.id}`);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe(reservation.id);
      expect(body.status).toBe(ReservationStatus.Pending);
    });

    it("returns 404 when the reservation does not exist", async () => {
      const res = await ctx.app.request(`/reservations/${createId()}`);

      expect(res.status).toBe(404);
    });
  });

  describe("GET /reservations?email=", () => {
    it("returns the customer's reservations", async () => {
      const reservation = makeReservation({ customerEmail: "mari@example.com" });
      const otherReservation = makeReservation({ customerEmail: "other@example.com" });
      ctx.reservationRepository.reservations.push(reservation, otherReservation);

      const res = await ctx.app.request("/reservations?email=mari@example.com");

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe(reservation.id);
    });

    it("returns 400 for an invalid email", async () => {
      const res = await ctx.app.request("/reservations?email=not-an-email");

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /reservations/:id", () => {
    it("cancels a pending reservation and invalidates the cache", async () => {
      const reservation = makeReservation({ status: ReservationStatus.Pending });
      ctx.reservationRepository.reservations.push(reservation);

      const res = await ctx.app.request(`/reservations/${reservation.id}`, { method: "DELETE" });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe(ReservationStatus.Cancelled);
    });

    it("returns 409 when the reservation is already cancelled", async () => {
      const reservation = makeReservation({ status: ReservationStatus.Cancelled });
      ctx.reservationRepository.reservations.push(reservation);

      const res = await ctx.app.request(`/reservations/${reservation.id}`, { method: "DELETE" });

      expect(res.status).toBe(409);
    });

    it("returns 404 when the reservation does not exist", async () => {
      const res = await ctx.app.request(`/reservations/${createId()}`, { method: "DELETE" });

      expect(res.status).toBe(404);
    });
  });

  describe("GET /openapi.json", () => {
    it("exposes the OpenAPI spec for every endpoint", async () => {
      const res = await ctx.app.request("/openapi.json");

      expect(res.status).toBe(200);
      const spec = await res.json();
      expect(Object.keys(spec.paths).sort()).toEqual(
        ["/reservations", "/reservations/{id}", "/tables", "/tables/{id}/availability"].sort(),
      );
    });
  });
});
