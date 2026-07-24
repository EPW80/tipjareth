import addresses from "../../../config/addresses.json";

export const TIP_JAR_ADDRESS: string = addresses.TipJar;
export const EXPECTED_CHAIN_ID: number = addresses.chainId;

// Human-readable ABI (ethers v6) — keep in sync with contracts/contracts/TipJar.sol
export const TIP_JAR_ABI = [
  "function registerCreator(string username)",
  "function tipCreator(address creatorAddress, string message, bool isAnonymous, uint256 acceptedMaxFeeBps) payable",
  "function withdraw()",
  "function getCreator(address creatorAddress) view returns (tuple(string username, bool isActive, uint256 balance, uint256 totalReceived, uint256 tipCount))",
  "function platformFeeBps() view returns (uint256)",
  "function minTipWei() view returns (uint256)",
  "event TipReceived(address indexed from, address indexed creator, uint256 amount, uint256 fee, string message, bool isAnonymous)",
] as const;
