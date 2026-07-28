import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app";
import { Creator } from "../models/Creator";
import { Tip } from "../models/Tip";
import * as chainService from "../services/chainService";

vi.mock("../services/chainService", () => ({
  getOnChainCreator: vi.fn(),
}));

const app = createApp();
const getOnChainCreator = vi.mocked(chainService.getOnChainCreator);
const WALLET = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const WALLET2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

// default: the wallet has registered "alice" on-chain (ownership proven)
beforeEach(() => {
  getOnChainCreator.mockResolvedValue({ isActive: true, username: "alice" });
});

describe("POST /api/creators", () => {
  it("creates a creator profile", async () => {
    const res = await request(app)
      .post("/api/creators")
      .send({ walletAddress: WALLET, username: "alice", bio: "streamer" });

    expect(res.status).toBe(201);
    expect(res.body.walletAddress).toBe(WALLET.toLowerCase());
    expect(res.body.username).toBe("alice");
    expect(res.body.stats).toEqual({ totalReceivedWei: "0", tipCount: 0 });
  });

  it("rejects an invalid wallet address", async () => {
    const res = await request(app)
      .post("/api/creators")
      .send({ walletAddress: "0x123", username: "alice" });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid username", async () => {
    const res = await request(app)
      .post("/api/creators")
      .send({ walletAddress: WALLET, username: "a!" });
    expect(res.status).toBe(400);
  });

  it("returns 409 for a duplicate wallet", async () => {
    await Creator.create({ walletAddress: WALLET.toLowerCase(), username: "alice" });
    const res = await request(app)
      .post("/api/creators")
      .send({ walletAddress: WALLET, username: "alice" });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already registered/i);
  });

  it("rejects a wallet not registered on-chain", async () => {
    getOnChainCreator.mockResolvedValue({ isActive: false, username: "" });
    const res = await request(app)
      .post("/api/creators")
      .send({ walletAddress: WALLET, username: "alice" });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/register on-chain/i);
  });

  it("rejects a username that doesn't match the on-chain registration", async () => {
    getOnChainCreator.mockResolvedValue({ isActive: true, username: "someone_else" });
    const res = await request(app)
      .post("/api/creators")
      .send({ walletAddress: WALLET, username: "alice" });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/match your on-chain/i);
  });

  it("returns 409 for a duplicate username", async () => {
    await Creator.create({ walletAddress: WALLET.toLowerCase(), username: "alice" });
    const res = await request(app)
      .post("/api/creators")
      .send({ walletAddress: WALLET2, username: "alice" });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/username already taken/i);
  });
});

describe("GET /api/creators", () => {
  it("lists creators with pagination", async () => {
    await Creator.create(
      { walletAddress: WALLET.toLowerCase(), username: "alice" },
      { walletAddress: WALLET2.toLowerCase(), username: "bob" }
    );
    const res = await request(app).get("/api/creators?limit=1&page=1");
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.total).toBe(2);
  });

  it("caps limit at 50", async () => {
    const res = await request(app).get("/api/creators?limit=500");
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(50);
  });
});

describe("GET /api/creators/:walletAddress", () => {
  it("returns the creator case-insensitively", async () => {
    await Creator.create({ walletAddress: WALLET.toLowerCase(), username: "alice" });
    const res = await request(app).get(`/api/creators/${WALLET}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe("alice");
  });

  it("404s for an unknown creator", async () => {
    const res = await request(app).get(`/api/creators/${WALLET}`);
    expect(res.status).toBe(404);
  });

  it("400s for a malformed address", async () => {
    const res = await request(app).get("/api/creators/not-an-address");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/creators/:walletAddress/stats", () => {
  it("aggregates confirmed tips only", async () => {
    await Creator.create({ walletAddress: WALLET.toLowerCase(), username: "alice" });
    await Tip.create(
      {
        txHash: "0x" + "1".repeat(64),
        status: "confirmed",
        creatorAddress: WALLET.toLowerCase(),
        fromAddress: WALLET2.toLowerCase(),
        amountWei: "10000000000000000",
        feeWei: "250000000000000",
      },
      {
        txHash: "0x" + "2".repeat(64),
        status: "confirmed",
        creatorAddress: WALLET.toLowerCase(),
        fromAddress: WALLET2.toLowerCase(),
        amountWei: "5000000000000000",
        feeWei: "125000000000000",
      },
      {
        txHash: "0x" + "3".repeat(64),
        status: "pending",
        creatorAddress: WALLET.toLowerCase(),
      }
    );

    const res = await request(app).get(`/api/creators/${WALLET}/stats`);
    expect(res.status).toBe(200);
    expect(res.body.tipCount).toBe(2);
    // net received (amount − fee): 9.75e15 + 4.875e15
    expect(res.body.totalWei).toBe("14625000000000000");
    expect(res.body.uniqueTipperCount).toBe(1);
  });

  it("returns zeros for a creator with no tips", async () => {
    await Creator.create({ walletAddress: WALLET.toLowerCase(), username: "alice" });
    const res = await request(app).get(`/api/creators/${WALLET}/stats`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ totalWei: "0", tipCount: 0, uniqueTipperCount: 0 });
  });
});
