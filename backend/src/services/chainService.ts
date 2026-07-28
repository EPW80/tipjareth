import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { Contract, Interface, JsonRpcProvider } from "ethers";
import { env } from "../config/env";
import { logger } from "../config/logger";

const TIP_JAR_ABI = [
  "event TipReceived(address indexed from, address indexed creator, uint256 amount, uint256 fee, string message, bool isAnonymous)",
  "function getCreator(address creatorAddress) view returns (tuple(string username, bool isActive, uint256 balance, uint256 totalReceived, uint256 tipCount))",
];

const tipJarInterface = new Interface(TIP_JAR_ABI);

export interface VerifiedTip {
  status: "confirmed" | "failed";
  fromAddress: string;
  creatorAddress: string;
  amountWei: string;
  feeWei: string;
  message: string;
  isAnonymous: boolean;
  blockNumber: number;
}

let provider: JsonRpcProvider | undefined;

function getProvider(): JsonRpcProvider {
  if (!provider) provider = new JsonRpcProvider(env.rpcUrl);
  return provider;
}

export interface OnChainCreator {
  username: string;
  isActive: boolean;
}

/**
 * Read a creator's on-chain registration. Because only the wallet owner can
 * call `registerCreator` (msg.sender), an active record with a matching
 * username proves the caller controls `address` — used to gate profile
 * creation against spoofing/squatting.
 */
export async function getOnChainCreator(address: string): Promise<OnChainCreator> {
  const contract = new Contract(getTipJarAddress(), TIP_JAR_ABI, getProvider());
  const c = await contract.getCreator(address);
  return { username: c.username as string, isActive: c.isActive as boolean };
}

export function getTipJarAddress(): string {
  const path = join(__dirname, "..", "..", "..", "config", "addresses.json");
  if (!existsSync(path)) {
    throw new Error("config/addresses.json not found — run `npm run deploy:local` first");
  }
  const { TipJar } = JSON.parse(readFileSync(path, "utf-8"));
  if (!TipJar) throw new Error("TipJar address missing from config/addresses.json");
  return TipJar as string;
}

/**
 * Verify a tip transaction on-chain. All tip data comes from the receipt's
 * TipReceived event — client-supplied values are never trusted.
 * Returns null while the transaction is not yet mined.
 */
export async function verifyTip(txHash: string): Promise<VerifiedTip | null> {
  const receipt = await getProvider().getTransactionReceipt(txHash);
  if (!receipt) return null; // still pending

  if (receipt.status !== 1) {
    return {
      status: "failed",
      fromAddress: receipt.from.toLowerCase(),
      creatorAddress: "",
      amountWei: "0",
      feeWei: "0",
      message: "",
      isAnonymous: false,
      blockNumber: receipt.blockNumber,
    };
  }

  const tipJarAddress = getTipJarAddress().toLowerCase();
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== tipJarAddress) continue;
    const parsed = tipJarInterface.parseLog({ topics: [...log.topics], data: log.data });
    if (parsed?.name !== "TipReceived") continue;

    return {
      status: "confirmed",
      fromAddress: (parsed.args.from as string).toLowerCase(),
      creatorAddress: (parsed.args.creator as string).toLowerCase(),
      amountWei: (parsed.args.amount as bigint).toString(),
      feeWei: (parsed.args.fee as bigint).toString(),
      message: parsed.args.message as string,
      isAnonymous: parsed.args.isAnonymous as boolean,
      blockNumber: receipt.blockNumber,
    };
  }

  logger.warn(`tx ${txHash} mined but contains no TipReceived event from TipJar`);
  return {
    status: "failed",
    fromAddress: receipt.from.toLowerCase(),
    creatorAddress: "",
    amountWei: "0",
    feeWei: "0",
    message: "",
    isAnonymous: false,
    blockNumber: receipt.blockNumber,
  };
}
