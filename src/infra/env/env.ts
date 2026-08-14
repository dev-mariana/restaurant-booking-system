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
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsedEnv.error));

  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
