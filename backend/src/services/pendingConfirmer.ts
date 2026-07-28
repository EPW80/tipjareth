import { Tip } from "../models/Tip";
import { logger } from "../config/logger";
import * as chainService from "./chainService";
import { applyConfirmedTip } from "./tipConfirmation";

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

      // shared atomic confirm + credit (idempotent across concurrent passes
      // and the API's submitTip path)
      await applyConfirmedTip(tip.txHash, verified);
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
