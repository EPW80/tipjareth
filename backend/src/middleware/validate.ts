import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array().map((e) => ({ field: e.type === "field" ? e.path : undefined, message: e.msg })) });
    return;
  }
  next();
}
