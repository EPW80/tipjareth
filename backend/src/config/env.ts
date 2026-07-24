import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 5000),
  mongodbUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017/tipflow-local",
  rpcUrl: process.env.RPC_URL ?? "http://127.0.0.1:8545",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
};
