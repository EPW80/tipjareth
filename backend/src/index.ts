import mongoose from "mongoose";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { startPendingTipConfirmer } from "./services/pendingConfirmer";

async function main() {
  await mongoose.connect(env.mongodbUri);
  logger.info(`connected to MongoDB at ${env.mongodbUri}`);

  const app = createApp();
  app.listen(env.port, () => {
    logger.info(`API listening on :${env.port}`);
  });

  startPendingTipConfirmer();
}

main().catch((err) => {
  logger.error("fatal startup error", { err: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
