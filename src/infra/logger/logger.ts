import pino from "pino";
import { env } from "../env/env.js";

export const logger = pino({ level: env.LOG_LEVEL });
