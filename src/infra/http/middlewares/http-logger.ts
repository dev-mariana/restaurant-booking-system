import type { MiddlewareHandler } from "hono";
import { createId } from "../../../common/helpers/generate-id.js";
import { logger } from "../../logger/logger.js";

export const httpLogger: MiddlewareHandler = async (c, next) => {
  const requestId = createId();
  const start = performance.now();

  await next();

  const durationMs = performance.now() - start;

  logger.info({
    requestId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    durationMs: Math.round(durationMs),
  });
};
