# Web3 Frontend Integration Guide

This repo uses **ethers v6 directly** — no wagmi, RainbowKit, or @tanstack packages (dependency policy in `.claude/CLAUDE.md`).

## Wallet Connection (EIP-1193 + BrowserProvider)

```typescript
import { BrowserProvider } from "ethers";

const provider = new BrowserProvider(window.ethereum);
const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
const signer = await provider.getSigner();
```

Listen for account/chain changes and update React state:

```typescript
window.ethereum.on("accountsChanged", handleAccounts);
window.ethereum.on("chainChanged", () => window.location.reload());
```

All of this lives in `frontend/src/hooks/web3/WalletProvider.tsx` — components consume `useWallet()`, never `window.ethereum`.

## Contract Interaction

```typescript
import { Contract, parseEther } from "ethers";

const tipJar = new Contract(address, abi, signer);
const tx = await tipJar.tipCreator(creatorAddress, message, isAnonymous, {
  value: parseEther(amountEth),
});
const receipt = await tx.wait();          // update UI only after this resolves
await api.post("/api/tips", { txHash: tx.hash });  // backend verifies on-chain
```

## Error Handling (ethers v6 codes)

```typescript
export function friendlyChainError(err: unknown): string {
  const e = err as { code?: string };
  switch (e.code) {
    case "ACTION_REJECTED":    return "Transaction cancelled";
    case "INSUFFICIENT_FUNDS": return "Insufficient balance for this tip";
    case "CALL_EXCEPTION":     return "Transaction failed — check the tip amount and try again";
    default:                   return "Something went wrong. Please try again.";
  }
}
```

Never render `err.message` from the chain to users.

## API Data (no fetching library)

Custom hooks over `fetch` in `frontend/src/hooks/api/`:

```typescript
const { data, loading, error, refetch } = useApi<Creator[]>("/api/creators");
```
