import { BrowserProvider, JsonRpcSigner } from "ethers";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { EXPECTED_CHAIN_ID } from "../../config/contracts";

interface WalletState {
  account: string | null;
  chainId: number | null;
  hasWallet: boolean;
  wrongNetwork: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  getSigner: () => Promise<JsonRpcSigner>;
  getProvider: () => BrowserProvider;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const hasWallet = typeof window !== "undefined" && !!window.ethereum;

  const getProvider = useCallback(() => {
    if (!window.ethereum) throw new Error("No wallet installed");
    return new BrowserProvider(window.ethereum);
  }, []);

  const getSigner = useCallback(async () => {
    return getProvider().getSigner();
  }, [getProvider]);

  const connect = useCallback(async () => {
    if (!window.ethereum) return;
    setConnecting(true);
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      setAccount(accounts[0]?.toLowerCase() ?? null);
      const network = await getProvider().getNetwork();
      setChainId(Number(network.chainId));
    } finally {
      setConnecting(false);
    }
  }, [getProvider]);

  useEffect(() => {
    if (!window.ethereum) return;
    const onAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      setAccount(accounts[0]?.toLowerCase() ?? null);
    };
    const onChain = (...args: unknown[]) => {
      setChainId(Number(args[0] as string));
    };
    window.ethereum.on("accountsChanged", onAccounts);
    window.ethereum.on("chainChanged", onChain);
    return () => {
      window.ethereum?.removeListener("accountsChanged", onAccounts);
      window.ethereum?.removeListener("chainChanged", onChain);
    };
  }, []);

  const value = useMemo<WalletState>(
    () => ({
      account,
      chainId,
      hasWallet,
      wrongNetwork: chainId !== null && chainId !== EXPECTED_CHAIN_ID,
      connecting,
      connect,
      getSigner,
      getProvider,
    }),
    [account, chainId, hasWallet, connecting, connect, getSigner, getProvider],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
