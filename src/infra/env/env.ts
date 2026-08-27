import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.url(),
  REDIS_PORT: z.coerce.number().int().positive(),
  REDIS_URL: z.url(),
  RESERVATION_QUEUE_NAME: z.string().min(1),
  CONFIRM_RESERVATION_JOB_NAME: z.string().min(1),
  WORKER_CONCURRENCY: z.coerce.number().int().positive(),
  BULL_BOARD_BASE_PATH: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsedEnv.error));

  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
