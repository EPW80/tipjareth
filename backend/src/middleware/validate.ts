import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors
      .array()
      .map((e) => ({ field: e.type === "field" ? e.path : undefined, message: e.msg }));
    // `error` matches every other error response (and the frontend's apiFetch,
    // which reads body.error); `errors` keeps the per-field detail.
    res.status(400).json({ error: details[0]?.message ?? "Validation failed", errors: details });
    return;
  }
  next();
}
