import { Contract, parseEther } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { TIP_JAR_ABI, TIP_JAR_ADDRESS } from "../../config/contracts";
import { apiFetch } from "../api/useApi";
import { useWallet } from "./WalletProvider";

export interface OnChainCreator {
  username: string;
  isActive: boolean;
  balance: bigint;
  totalReceived: bigint;
  tipCount: bigint;
}

type TxState = "idle" | "signing" | "mining" | "done";

/** Read-only contract data: current platform fee + min tip (shown before signing). */
export function useTipJarInfo() {
  const { getProvider, hasWallet } = useWallet();
  const [feeBps, setFeeBps] = useState<bigint | null>(null);
  const [minTipWei, setMinTipWei] = useState<bigint | null>(null);

  useEffect(() => {
    if (!hasWallet) return;
    const contract = new Contract(TIP_JAR_ADDRESS, TIP_JAR_ABI, getProvider());
    Promise.all([contract.platformFeeBps(), contract.minTipWei()])
      .then(([fee, min]) => {
        setFeeBps(fee as bigint);
        setMinTipWei(min as bigint);
      })
      .catch(() => {
        setFeeBps(null);
        setMinTipWei(null);
      });
  }, [getProvider, hasWallet]);

  return { feeBps, minTipWei };
}

export function useCreatorOnChain(address: string | null) {
  const { getProvider, hasWallet } = useWallet();
  const [creator, setCreator] = useState<OnChainCreator | null>(null);

  const refresh = useCallback(async () => {
    if (!address || !hasWallet) return;
    const contract = new Contract(TIP_JAR_ADDRESS, TIP_JAR_ABI, getProvider());
    const c = await contract.getCreator(address);
    setCreator({
      username: c.username,
      isActive: c.isActive,
      balance: c.balance,
      totalReceived: c.totalReceived,
      tipCount: c.tipCount,
    });
  }, [address, getProvider, hasWallet]);

  useEffect(() => {
    refresh().catch(() => setCreator(null));
  }, [refresh]);

  return { creator, refresh };
}

/**
 * Send a tip. `displayedFeeBps` is passed on-chain as acceptedMaxFeeBps so the
 * user can never be charged more than the fee the UI showed them.
 */
export function useTipCreator() {
  const { getSigner } = useWallet();
  const [state, setState] = useState<TxState>("idle");

  const tip = useCallback(
    async (opts: {
      creatorAddress: string;
      amountEth: string;
      message: string;
      isAnonymous: boolean;
      displayedFeeBps: bigint;
    }) => {
      setState("signing");
      try {
        const signer = await getSigner();
        const contract = new Contract(TIP_JAR_ADDRESS, TIP_JAR_ABI, signer);
        const tx = await contract.tipCreator(
          opts.creatorAddress,
          opts.message,
          opts.isAnonymous,
          opts.displayedFeeBps,
          { value: parseEther(opts.amountEth) }
        );
        setState("mining");
        await tx.wait(); // UI updates only after confirmation
        await apiFetch("/api/tips", {
          method: "POST",
          body: JSON.stringify({ txHash: tx.hash }),
        });
        setState("done");
        return tx.hash as string;
      } catch (err) {
        setState("idle");
        throw err;
      }
    },
    [getSigner]
  );

  return { tip, state, reset: () => setState("idle") };
}

export function useRegisterCreator() {
  const { getSigner } = useWallet();
  const [state, setState] = useState<TxState>("idle");

  const register = useCallback(
    async (username: string) => {
      setState("signing");
      try {
        const signer = await getSigner();
        const contract = new Contract(TIP_JAR_ADDRESS, TIP_JAR_ABI, signer);
        const tx = await contract.registerCreator(username);
        setState("mining");
        await tx.wait();
        setState("done");
      } catch (err) {
        setState("idle");
        throw err;
      }
    },
    [getSigner]
  );

  return { register, state };
}

export function useWithdraw() {
  const { getSigner } = useWallet();
  const [state, setState] = useState<TxState>("idle");

  const withdraw = useCallback(async () => {
    setState("signing");
    try {
      const signer = await getSigner();
      const contract = new Contract(TIP_JAR_ADDRESS, TIP_JAR_ABI, signer);
      const tx = await contract.withdraw();
      setState("mining");
      await tx.wait();
      setState("done");
    } catch (err) {
      setState("idle");
      throw err;
    }
  }, [getSigner]);

  return { withdraw, state, reset: () => setState("idle") };
}
