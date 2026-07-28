import { Types } from "mongoose";
import { Creator } from "../models/Creator";
import { Tip } from "../models/Tip";
import type { VerifiedTip } from "./chainService";

/**
 * Atomically confirm a tip and credit its creator's stats exactly once.
 *
 * Both the API (`submitTip`) and the background poller (`confirmPendingTips`)
 * call this, sometimes concurrently for the same txHash. The `status !=
 * confirmed` filter means only one caller can win the pending→confirmed
 * transition; the loser's upsert violates the unique txHash index (E11000)
 * and is treated as "already confirmed" — so stats are never double-counted.
 */
export async function applyConfirmedTip(txHash: string, verified: VerifiedTip) {
  const creator = await Creator.findOne({ walletAddress: verified.creatorAddress });

  const confirmedFields = {
    status: "confirmed" as const,
    fromAddress: verified.fromAddress,
    creatorAddress: verified.creatorAddress,
    creator: creator?._id,
    amountWei: verified.amountWei,
    feeWei: verified.feeWei,
    message: verified.message,
    isAnonymous: verified.isAnonymous,
    blockNumber: verified.blockNumber,
  };

  try {
    const tip = await Tip.findOneAndUpdate(
      { txHash, status: { $ne: "confirmed" } },
      { $set: confirmedFields },
      { new: true, upsert: true },
    );
    // reaching here means we won the transition — credit stats once
    if (creator) await creditCreator(creator._id, verified);
    return { tip, credited: true };
  } catch (err) {
    // concurrent caller already confirmed this txHash (duplicate-key on upsert)
    if ((err as { code?: number }).code === 11000) {
      const tip = await Tip.findOne({ txHash });
      return { tip, credited: false };
    }
    throw err;
  }
}

/**
 * Credit tipCount and the net (amount − fee) received in a single atomic
 * aggregation-pipeline update, so concurrent confirmations of different tips
 * to the same creator can't lose updates. Wei stays a string; the Decimal
 * math runs server-side in Mongo.
 */
async function creditCreator(creatorId: Types.ObjectId, verified: VerifiedTip) {
  const net = (BigInt(verified.amountWei) - BigInt(verified.feeWei)).toString();
  await Creator.updateOne({ _id: creatorId }, [
    {
      $set: {
        "stats.tipCount": { $add: [{ $ifNull: ["$stats.tipCount", 0] }, 1] },
        "stats.totalReceivedWei": {
          $toString: {
            $add: [
              { $toDecimal: { $ifNull: ["$stats.totalReceivedWei", "0"] } },
              { $toDecimal: net },
            ],
          },
        },
      },
    },
  ]);
}
