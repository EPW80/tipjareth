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

interface DuplicateKeyError {
  code: number;
  keyPattern?: Record<string, unknown>;
}

function isDuplicateKeyError(err: unknown): err is DuplicateKeyError {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: number }).code === 11000
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  // Unique-index violation from a concurrent insert (the controllers' explicit
  // findOne check handles the common case; this is the race safety net).
  if (isDuplicateKeyError(err)) {
    const field = Object.keys(err.keyPattern ?? {})[0];
    const message =
      field === "walletAddress"
        ? "Wallet address already registered"
        : field === "username"
          ? "Username already taken"
          : "That value is already taken";
    res.status(409).json({ error: message });
    return;
  }
  logger.error("unhandled error", { err: err instanceof Error ? err.message : String(err) });
  res.status(500).json({ error: "Internal server error" });
}
