# Restaurant Table Booking System

Applied system-design study backend: caching, queueing and hexagonal architecture.

A restaurant with a fixed set of tables, where customers can check time-slot availability and
request reservations. The domain is deliberately simple — the project's focus is on applying, in
practice, cache concepts (cache-aside with active invalidation), queues (as a concurrency
serializer, not just async offload) and a layered architecture (hexagonal with tactical DDD).

## Stack

| Category          | Technology                                                |
| ----------------- | --------------------------------------------------------- |
| Runtime           | Node.js + TypeScript (via `tsx`)                          |
| HTTP framework    | [Hono](https://hono.dev/)                                 |
| Database          | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/)     |
| Cache             | Redis (`ioredis`)                                         |
| Queue             | [BullMQ](https://docs.bullmq.io/) + Bull Board            |
| Validation / docs | Zod + `@hono/zod-openapi` + [Scalar](https://scalar.com/) |
| Logs              | Pino (structured, JSON)                                   |
| Tests             | Vitest                                                    |
| Lint/format       | Biome                                                     |

## Getting started

### Prerequisites

- Node.js 26+ (`@types/node` is pinned to that major)
- Docker (for Postgres and Redis)

### 1. Start local infrastructure

```bash
docker compose up -d
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Adjust the values as needed — they must stay consistent with `docker-compose.yml` (Postgres
user/password/port, Redis port, etc.).

### 3. Install dependencies and run migrations

```bash
npm install
npm run db:migrate
```

### 4. Run the HTTP server

```bash
npm run dev
```

The API comes up on `http://localhost:3000`.

### 5. Run the reservation confirmation worker

In another terminal:

```bash
npx tsx watch src/worker.ts
```

The worker is a separate process: it consumes the BullMQ queue and decides, table by table,
whether each `pending` reservation should be `confirmed` or `rejected`.

## Exploring the API

- **Interactive docs (Scalar):** `http://localhost:3000/docs`
- **OpenAPI spec (JSON):** `http://localhost:3000/openapi.json`
- **Bull Board (queue monitoring):** `http://localhost:3000/<BULL_BOARD_BASE_PATH>` (value set
  in `.env`)

### Endpoints

| Method   | Route                            | Description                                                     |
| -------- | -------------------------------- | --------------------------------------------------------------- |
| `GET`    | `/tables`                        | List the restaurant's tables                                    |
| `GET`    | `/tables/:id/availability?date=` | Time-slot availability for a day (cache-aside)                  |
| `POST`   | `/reservations`                  | Request a reservation (`pending`, queues a job, `202 Accepted`) |
| `GET`    | `/reservations/:id`              | Check a reservation's current status (polling)                  |
| `GET`    | `/reservations?email=`           | List a customer's reservations by email                         |
| `DELETE` | `/reservations/:id`              | Cancel a reservation (invalidates the cache)                    |

### Reservation flow

1. `POST /reservations` validates the input, saves the reservation as `pending` and queues a job
   in BullMQ — the response is immediate (`202`), without waiting for confirmation.
2. A separate worker processes the job, checks availability (only `confirmed` reservations count
   as occupied) and decides `confirmed` or `rejected`. Concurrency is controlled per table, which
   resolves the race condition between two customers booking the same time slot.
3. The customer polls the result via `GET /reservations/:id`.
4. While a reservation is still `pending` or `confirmed`, the customer can cancel it with
   `DELETE /reservations/:id`, moving it to `cancelled`. `rejected` and `cancelled` are terminal —
   they can't be cancelled again (`409 Conflict` if attempted).
5. Every status change (confirmation, rejection, cancellation) actively invalidates the
   availability cache for that table/day, so the next availability check reflects it immediately
   instead of waiting for the TTL to expire.

## Observability

- **Structured logs (Pino):** every HTTP request produces a log line (`method`, `path`, `status`,
  `durationMs`, `requestId`); key business events (reservation created, confirmed/rejected,
  cancelled, cache hit/miss) are logged too. Level configurable via `LOG_LEVEL` in `.env`.
- **Bull Board:** visualization of queue jobs (pending, failed, completed).

## Tests

```bash
npm test              # runs the whole suite once
npm run test:watch    # watch mode
npm run test:coverage # with coverage
```

The suite covers:

- Domain (time-slot overlap, status transitions, time-interval value object).
- Application services, with repository/cache/queue fakes (no real infrastructure).
- Race condition on reservation confirmation (per-table serialization).
- End-to-end HTTP integration (`src/app.test.ts`), via Hono's `app.request()` with fakes — no
  real Postgres/Redis involved.

## Useful scripts

| Command                                             | Description                                       |
| --------------------------------------------------- | ------------------------------------------------- |
| `npm run dev`                                       | Starts the HTTP server in watch mode              |
| `npm run build` / `npm start`                       | Production build and running the build            |
| `npm run lint` / `npm run format` / `npm run check` | Lint and formatting (Biome)                       |
| `npm run db:generate`                               | Generates a new migration from the Drizzle schema |
| `npm run db:migrate`                                | Applies pending migrations to the database        |

## Project structure

```
src/
  domain/        # entities, invariants and ports (interfaces) — depends on nothing
  application/    # use cases (services) and schemas — depends only on domain
  infra/          # concrete adapters: HTTP (Hono), Postgres (Drizzle), Redis, BullMQ, logger
  common/         # shared errors and helpers
  app.ts          # HTTP server composition root
  worker.ts       # worker composition root (separate process)
```
