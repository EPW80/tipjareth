import { NextFunction, Request, Response } from "express";
import { Tip } from "../models/Tip";
import * as chainService from "../services/chainService";
import { applyConfirmedTip } from "../services/tipConfirmation";

const MAX_PAGE_SIZE = 50;

/**
 * Client submits { txHash } after sending the transaction. Every field of the
 * stored tip comes from the on-chain TipReceived event, never from the client.
 */
export async function submitTip(req: Request, res: Response, next: NextFunction) {
  try {
    const txHash = (req.body.txHash as string).toLowerCase();

    const existing = await Tip.findOne({ txHash });
    if (existing?.status === "confirmed") {
      res.json(existing);
      return;
    }

    const verified = await chainService.verifyTip(txHash);

    if (!verified) {
      const pending = await Tip.findOneAndUpdate(
        { txHash },
        { $setOnInsert: { txHash, status: "pending" } },
        { new: true, upsert: true }
      );
      res.status(202).json(pending);
      return;
    }

    if (verified.status === "failed") {
      const failed = await Tip.findOneAndUpdate(
        { txHash },
        { $set: { status: "failed", blockNumber: verified.blockNumber } },
        { new: true, upsert: true }
      );
      res.json(failed);
      return;
    }

    // confirm + credit stats atomically (shared with the background poller,
    // so a concurrent confirmer pass can never double-count)
    const { tip } = await applyConfirmedTip(txHash, verified);

    res.status(existing ? 200 : 201).json(tip);
  } catch (err) {
    next(err);
  }
}

/** Anonymous tips never expose the sender address through the API. */
function serializeTip(tip: Record<string, unknown>) {
  if (tip.isAnonymous) {
    return { ...tip, fromAddress: null };
  }
  return tip;
}

export async function listTips(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(req.query.limit ?? 20)));

    const filter: Record<string, unknown> = { status: "confirmed" };
    if (req.query.creator) {
      filter.creatorAddress = String(req.query.creator).toLowerCase();
    }

    const [items, total] = await Promise.all([
      Tip.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Tip.countDocuments(filter),
    ]);

    res.json({ items: items.map(serializeTip), page, limit, total });
  } catch (err) {
    next(err);
  }
}
