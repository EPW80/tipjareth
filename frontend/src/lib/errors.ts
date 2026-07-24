/** Map ethers v6 / EIP-1193 errors to user-friendly messages. Never show raw chain errors. */
export function friendlyChainError(err: unknown): string {
  const e = err as { code?: string | number; message?: string };
  switch (e?.code) {
    case "ACTION_REJECTED":
    case 4001:
      return "Transaction cancelled.";
    case "INSUFFICIENT_FUNDS":
      return "Insufficient balance for this tip.";
    case "CALL_EXCEPTION":
      return "Transaction failed — check the tip amount and try again.";
    case "NETWORK_ERROR":
      return "Can't reach the network. Is your wallet on the right chain?";
    default:
      return "Something went wrong. Please try again.";
  }
}
