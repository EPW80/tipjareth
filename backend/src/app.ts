import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import creatorsRouter from "./routes/creators";
import tipsRouter from "./routes/tips";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.frontendUrl }));
  app.use(express.json({ limit: "16kb" }));
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 100, // 100 requests/minute per IP
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/creators", creatorsRouter);
  app.use("/api/tips", tipsRouter);

  app.use(errorHandler);
  return app;
}
