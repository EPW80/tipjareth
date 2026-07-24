import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  logger.error("unhandled error", { err: err instanceof Error ? err.message : String(err) });
  res.status(500).json({ error: "Internal server error" });
}
