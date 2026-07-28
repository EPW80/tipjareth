import { NextFunction, Request, Response } from "express";
import { Creator } from "../models/Creator";
import { Tip } from "../models/Tip";
import { HttpError } from "../middleware/errorHandler";
import * as chainService from "../services/chainService";

const MAX_PAGE_SIZE = 50;

export async function createCreator(req: Request, res: Response, next: NextFunction) {
  try {
    const walletAddress = (req.body.walletAddress as string).toLowerCase();
    const { username, bio = "", avatarUrl = "" } = req.body;

    // Ownership gate: the profile can only be created by the wallet that
    // actually registered this username on-chain (registerCreator uses
    // msg.sender), preventing wallet spoofing and username squatting.
    const onChain = await chainService.getOnChainCreator(walletAddress);
    if (!onChain.isActive) {
      throw new HttpError(403, "Register on-chain before creating a profile.");
    }
    if (onChain.username !== username) {
      throw new HttpError(409, "Username doesn't match your on-chain registration.");
    }

    const existing = await Creator.findOne({
      $or: [{ walletAddress }, { username }],
    }).lean();
    if (existing) {
      throw new HttpError(
        409,
        existing.walletAddress === walletAddress
          ? "Wallet address already registered"
          : "Username already taken"
      );
    }

    const creator = await Creator.create({ walletAddress, username, bio, avatarUrl });
    res.status(201).json(creator);
  } catch (err) {
    next(err);
  }
}

export async function listCreators(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(req.query.limit ?? 20)));

    const [items, total] = await Promise.all([
      Creator.find()
        .sort({ "stats.tipCount": -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Creator.countDocuments(),
    ]);

    res.json({ items, page, limit, total });
  } catch (err) {
    next(err);
  }
}

export async function getCreator(req: Request, res: Response, next: NextFunction) {
  try {
    const creator = await Creator.findOne({
      walletAddress: req.params.walletAddress.toLowerCase(),
    }).lean();
    if (!creator) throw new HttpError(404, "Creator not found");
    res.json(creator);
  } catch (err) {
    next(err);
  }
}

export async function getCreatorStats(req: Request, res: Response, next: NextFunction) {
  try {
    const creatorAddress = req.params.walletAddress.toLowerCase();
    const creator = await Creator.findOne({ walletAddress: creatorAddress }).lean();
    if (!creator) throw new HttpError(404, "Creator not found");

    const [stats] = await Tip.aggregate([
      { $match: { creatorAddress, status: "confirmed" } },
      {
        $group: {
          _id: null,
          // net received (amount − fee), matching Creator.stats and on-chain totalReceived
          totalWei: {
            $sum: {
              $subtract: [
                { $toDecimal: "$amountWei" },
                { $toDecimal: { $ifNull: ["$feeWei", "0"] } },
              ],
            },
          },
          tipCount: { $sum: 1 },
          uniqueTippers: { $addToSet: "$fromAddress" },
        },
      },
      {
        $project: {
          _id: 0,
          totalWei: { $toString: "$totalWei" },
          tipCount: 1,
          uniqueTipperCount: { $size: "$uniqueTippers" },
        },
      },
    ]);

    res.json(stats ?? { totalWei: "0", tipCount: 0, uniqueTipperCount: 0 });
  } catch (err) {
    next(err);
  }
}
