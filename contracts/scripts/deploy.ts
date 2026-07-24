import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const tipJar = await ethers.deployContract("TipJar", [deployer.address]);
  await tipJar.waitForDeployment();

  const address = await tipJar.getAddress();
  const chainId = Number((await ethers.provider.getNetwork()).chainId);

  const configDir = join(__dirname, "..", "..", "config");
  mkdirSync(configDir, { recursive: true });
  writeFileSync(
    join(configDir, "addresses.json"),
    JSON.stringify({ chainId, network: network.name, TipJar: address }, null, 2) + "\n"
  );

  console.log(`TipJar deployed to ${address} (network=${network.name}, chainId=${chainId})`);
  console.log("Wrote config/addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
