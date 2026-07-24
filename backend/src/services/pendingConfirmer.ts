import { Creator } from "../models/Creator";
import { Tip } from "../models/Tip";
import { logger } from "../config/logger";
import * as chainService from "./chainService";

const POLL_INTERVAL_MS = 15_000;

/** Re-checks pending tips so a tip submitted before mining still confirms. */
export async function confirmPendingTips() {
  const pending = await Tip.find({ status: "pending" }).limit(100);
  for (const tip of pending) {
    try {
      const verified = await chainService.verifyTip(tip.txHash);
      if (!verified) continue;

      if (verified.status === "failed") {
        tip.status = "failed";
        tip.blockNumber = verified.blockNumber;
        await tip.save();
        continue;
      }

      const creator = await Creator.findOne({ walletAddress: verified.creatorAddress });
      tip.set({
        status: "confirmed",
        fromAddress: verified.fromAddress,
        creatorAddress: verified.creatorAddress,
        creator: creator?._id,
        amountWei: verified.amountWei,
        feeWei: verified.feeWei,
        message: verified.message,
        isAnonymous: verified.isAnonymous,
        blockNumber: verified.blockNumber,
      });
      await tip.save();

      if (creator) {
        const creatorAmount = BigInt(verified.amountWei) - BigInt(verified.feeWei);
        await Creator.updateOne(
          { _id: creator._id },
          {
            $inc: { "stats.tipCount": 1 },
            $set: {
              "stats.totalReceivedWei": (
                BigInt(creator.stats?.totalReceivedWei ?? "0") + creatorAmount
              ).toString(),
            },
          }
        );
      }
    } catch (err) {
      logger.warn(`failed to confirm pending tip ${tip.txHash}`, {
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

export function startPendingTipConfirmer() {
  setInterval(() => {
    confirmPendingTips().catch((err) =>
      logger.warn("pending confirmer pass failed", {
        err: err instanceof Error ? err.message : String(err),
      })
    );
  }, POLL_INTERVAL_MS).unref();
}
