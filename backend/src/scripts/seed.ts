/**
 * Seeds demo creators: registers them on-chain (Hardhat accounts 1 and 2) and
 * creates matching Mongo profiles, then sends one demo tip from account 3.
 * Requires: hardhat node running, contracts deployed (npm run deploy:local),
 * and MongoDB reachable at MONGODB_URI.
 */
import { Contract, JsonRpcProvider, parseEther } from "ethers";
import mongoose from "mongoose";
import { env } from "../config/env";
import { Creator } from "../models/Creator";
import { getTipJarAddress, verifyTip } from "../services/chainService";
import { applyConfirmedTip } from "../services/tipConfirmation";

const TIP_JAR_ABI = [
  "function registerCreator(string username)",
  "function tipCreator(address creatorAddress, string message, bool isAnonymous, uint256 acceptedMaxFeeBps) payable",
  "function platformFeeBps() view returns (uint256)",
  "function getCreator(address) view returns (tuple(string username, bool isActive, uint256 balance, uint256 totalReceived, uint256 tipCount))",
];

const DEMO_CREATORS = [
  { account: 1, username: "alice_streams", bio: "Indie game streamer and speedrunner." },
  { account: 2, username: "bob_builds", bio: "Live-coding open source every week." },
];

async function main() {
  const provider = new JsonRpcProvider(env.rpcUrl);
  const tipJarAddress = getTipJarAddress();
  await mongoose.connect(env.mongodbUri);

  for (const demo of DEMO_CREATORS) {
    const signer = await provider.getSigner(demo.account);
    const address = (await signer.getAddress()).toLowerCase();
    const tipJar = new Contract(tipJarAddress, TIP_JAR_ABI, signer);

    const onChain = await tipJar.getCreator(address);
    if (!onChain.isActive) {
      await (await tipJar.registerCreator(demo.username)).wait();
      console.log(`registered ${demo.username} on-chain (${address})`);
    }

    await Creator.updateOne(
      { walletAddress: address },
      { $setOnInsert: { walletAddress: address, username: demo.username, bio: demo.bio } },
      { upsert: true }
    );
    console.log(`seeded profile ${demo.username}`);
  }

  // one demo tip from account 3 to the first creator
  const tipper = await provider.getSigner(3);
  const creatorAddress = (await (await provider.getSigner(1)).getAddress()).toLowerCase();
  const tipJar = new Contract(tipJarAddress, TIP_JAR_ABI, tipper);
  const feeBps = await tipJar.platformFeeBps();
  const tx = await tipJar.tipCreator(creatorAddress, "Welcome to TipFlow!", false, feeBps, {
    value: parseEther("0.05"),
  });
  await tx.wait();

  // store it exactly like the API would: verify from the on-chain event, then
  // confirm + credit via the same idempotent path the API uses (safe to re-run)
  const verified = await verifyTip(tx.hash);
  if (verified?.status === "confirmed") {
    await applyConfirmedTip(tx.hash.toLowerCase(), verified);
    console.log(`seeded demo tip ${tx.hash}`);
  }

  await mongoose.disconnect();
  console.log("seed complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
