import pino from "pino";
import type { ILogger } from "../../domain/logger/logger.js";
import { env } from "../env/env.js";

const pinoInstance = pino({ level: env.LOG_LEVEL });

export const logger: ILogger & pino.Logger = pinoInstance;
