import { formatEther } from "ethers";

/** Render a wei string as a short ETH amount. */
export function formatEth(wei: string | bigint): string {
  const eth = formatEther(wei);
  const n = Number(eth);
  if (n === 0) return "0 ETH";
  if (n < 0.0001) return "<0.0001 ETH";
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH`;
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
