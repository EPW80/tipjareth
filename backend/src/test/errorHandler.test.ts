import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { errorHandler, HttpError } from "../middleware/errorHandler";

function mockRes() {
  const res = {} as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

const noop = vi.fn();

describe("errorHandler", () => {
  it("passes through an HttpError with its status and message", () => {
    const res = mockRes();
    errorHandler(new HttpError(403, "nope"), {} as Request, res, noop);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "nope" });
  });

  it("maps a Mongo duplicate-key error to 409 by field", () => {
    const res = mockRes();
    errorHandler({ code: 11000, keyPattern: { username: 1 } }, {} as Request, res, noop);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Username already taken" });

    const res2 = mockRes();
    errorHandler({ code: 11000, keyPattern: { walletAddress: 1 } }, {} as Request, res2, noop);
    expect(res2.status).toHaveBeenCalledWith(409);
    expect(res2.json).toHaveBeenCalledWith({ error: "Wallet address already registered" });
  });

  it("hides internals for an unknown error", () => {
    const res = mockRes();
    errorHandler(new Error("secret stack detail"), {} as Request, res, noop);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});
