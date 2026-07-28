import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app";
import { Creator } from "../models/Creator";
import { Tip } from "../models/Tip";
import * as chainService from "../services/chainService";
import type { VerifiedTip } from "../services/chainService";
import { confirmPendingTips } from "../services/pendingConfirmer";

vi.mock("../services/chainService", () => ({
  verifyTip: vi.fn(),
}));

const app = createApp();
const verifyTip = vi.mocked(chainService.verifyTip);

const CREATOR = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
const TIPPER = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
const TX = "0x" + "a".repeat(64);
const TX2 = "0x" + "b".repeat(64);

const confirmedTip: VerifiedTip = {
  status: "confirmed",
  fromAddress: TIPPER,
  creatorAddress: CREATOR,
  amountWei: "10000000000000000",
  feeWei: "250000000000000",
  message: "great work!",
  isAnonymous: false,
  blockNumber: 42,
};

beforeEach(() => {
  verifyTip.mockReset();
});

describe("POST /api/tips", () => {
  it("400s on a malformed txHash", async () => {
    const res = await request(app).post("/api/tips").send({ txHash: "0xzz" });
    expect(res.status).toBe(400);
    expect(verifyTip).not.toHaveBeenCalled();
  });

  it("stores a pending tip when the tx is not yet mined", async () => {
    verifyTip.mockResolvedValue(null);
    const res = await request(app).post("/api/tips").send({ txHash: TX });
    expect(res.status).toBe(202);
    expect(res.body.status).toBe("pending");
  });

  it("confirms a mined tip using only on-chain event data", async () => {
    await Creator.create({ walletAddress: CREATOR, username: "alice" });
    verifyTip.mockResolvedValue(confirmedTip);

    // client-supplied amount/creator must be ignored
    const res = await request(app)
      .post("/api/tips")
      .send({ txHash: TX, amountWei: "999999", creatorAddress: TIPPER });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("confirmed");
    expect(res.body.amountWei).toBe(confirmedTip.amountWei);
    expect(res.body.creatorAddress).toBe(CREATOR);
    expect(res.body.message).toBe("great work!");

    const creator = await Creator.findOne({ walletAddress: CREATOR }).lean();
    expect(creator!.stats!.tipCount).toBe(1);
    expect(creator!.stats!.totalReceivedWei).toBe("9750000000000000"); // amount - fee
  });

  it("is idempotent: re-submitting a confirmed tip does not double-count stats", async () => {
    await Creator.create({ walletAddress: CREATOR, username: "alice" });
    verifyTip.mockResolvedValue(confirmedTip);

    await request(app).post("/api/tips").send({ txHash: TX });
    const res = await request(app).post("/api/tips").send({ txHash: TX });

    expect(res.status).toBe(200);
    expect(await Tip.countDocuments({ txHash: TX })).toBe(1);
    const creator = await Creator.findOne({ walletAddress: CREATOR }).lean();
    expect(creator!.stats!.tipCount).toBe(1);
    expect(verifyTip).toHaveBeenCalledTimes(1); // second call short-circuits
  });

  it("confirms a previously pending tip and updates stats once", async () => {
    await Creator.create({ walletAddress: CREATOR, username: "alice" });
    verifyTip.mockResolvedValueOnce(null).mockResolvedValueOnce(confirmedTip);

    const first = await request(app).post("/api/tips").send({ txHash: TX });
    expect(first.body.status).toBe("pending");

    const second = await request(app).post("/api/tips").send({ txHash: TX });
    expect(second.status).toBe(200);
    expect(second.body.status).toBe("confirmed");

    const creator = await Creator.findOne({ walletAddress: CREATOR }).lean();
    expect(creator!.stats!.tipCount).toBe(1);
  });

  it("does not double-count when the poller and a resubmit confirm at once", async () => {
    await Creator.create({ walletAddress: CREATOR, username: "alice" });
    // first submit lands while pending, then the tx mines
    verifyTip.mockResolvedValueOnce(null);
    await request(app).post("/api/tips").send({ txHash: TX });
    verifyTip.mockResolvedValue(confirmedTip);

    // background poller and a client resubmit race to confirm the same tip
    await Promise.all([
      confirmPendingTips(),
      request(app).post("/api/tips").send({ txHash: TX }),
    ]);

    expect(await Tip.countDocuments({ txHash: TX })).toBe(1);
    const creator = await Creator.findOne({ walletAddress: CREATOR }).lean();
    expect(creator!.stats!.tipCount).toBe(1);
    expect(creator!.stats!.totalReceivedWei).toBe("9750000000000000");
  });

  it("credits two different tips without losing an update", async () => {
    await Creator.create({ walletAddress: CREATOR, username: "alice" });
    verifyTip.mockResolvedValue(confirmedTip); // same creator/amount, different txHashes

    await Promise.all([
      request(app).post("/api/tips").send({ txHash: TX }),
      request(app).post("/api/tips").send({ txHash: TX2 }),
    ]);

    const creator = await Creator.findOne({ walletAddress: CREATOR }).lean();
    expect(creator!.stats!.tipCount).toBe(2);
    expect(creator!.stats!.totalReceivedWei).toBe("19500000000000000"); // 2 × net
  });

  it("marks a reverted tx as failed", async () => {
    verifyTip.mockResolvedValue({
      status: "failed",
      fromAddress: TIPPER,
      creatorAddress: "",
      amountWei: "0",
      feeWei: "0",
      message: "",
      isAnonymous: false,
      blockNumber: 42,
    });
    const res = await request(app).post("/api/tips").send({ txHash: TX });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("failed");
  });
});

describe("GET /api/tips", () => {
  it("lists confirmed tips for a creator, newest first", async () => {
    await Tip.create(
      {
        txHash: "0x" + "1".repeat(64),
        status: "confirmed",
        creatorAddress: CREATOR,
        fromAddress: TIPPER,
        amountWei: "1",
        message: "one",
      },
      {
        txHash: "0x" + "2".repeat(64),
        status: "pending",
        creatorAddress: CREATOR,
      }
    );

    const res = await request(app).get(`/api/tips?creator=${CREATOR}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].message).toBe("one");
  });

  it("hides the sender address for anonymous tips", async () => {
    await Tip.create({
      txHash: "0x" + "1".repeat(64),
      status: "confirmed",
      creatorAddress: CREATOR,
      fromAddress: TIPPER,
      amountWei: "1",
      isAnonymous: true,
    });

    const res = await request(app).get("/api/tips");
    expect(res.status).toBe(200);
    expect(res.body.items[0].fromAddress).toBeNull();
  });

  it("400s on an invalid creator filter", async () => {
    const res = await request(app).get("/api/tips?creator=nope");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/health", () => {
  it("responds ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
