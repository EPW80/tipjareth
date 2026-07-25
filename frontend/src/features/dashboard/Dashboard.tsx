import { useState } from "react";
import { ErrorBoundary } from "../../components/shared/ErrorBoundary";
import { CreatorStats } from "../../hooks/api/types";
import { useApi } from "../../hooks/api/useApi";
import { useCreatorOnChain, useWithdraw } from "../../hooks/web3/useTipJar";
import { useWallet } from "../../hooks/web3/WalletProvider";
import { friendlyChainError } from "../../lib/errors";
import { formatEth } from "../../lib/format";
import { TipFeed } from "../tipping/TipFeed";

export function Dashboard() {
  const { account, connect } = useWallet();

  if (!account) {
    return (
      <div className="text-center">
        <p className="mb-4 text-slate-600">
          Connect your wallet to see your creator dashboard.
        </p>
        <button
          onClick={() => connect()}
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Connect wallet
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardContent account={account} />
    </ErrorBoundary>
  );
}

function DashboardContent({ account }: { account: string }) {
  const { creator, refresh } = useCreatorOnChain(account);
  const { data: stats } = useApi<CreatorStats>(
    `/api/creators/${account}/stats`,
  );
  const { withdraw, state } = useWithdraw();
  const [error, setError] = useState<string | null>(null);

  if (creator && !creator.isActive) {
    return (
      <p className="text-slate-600">
        This wallet isn't registered as a creator yet. Head to "Become a
        creator" to register.
      </p>
    );
  }

  async function handleWithdraw() {
    setError(null);
    try {
      await withdraw();
      await refresh();
    } catch (err) {
      setError(friendlyChainError(err));
    }
  }

  const busy = state === "signing" || state === "mining";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Dashboard{creator ? ` — @${creator.username}` : ""}
      </h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Available to withdraw</p>
          <p className="text-xl font-semibold">
            {creator ? formatEth(creator.balance) : "…"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total received</p>
          <p className="text-xl font-semibold">
            {creator ? formatEth(creator.totalReceived) : "…"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Unique tippers</p>
          <p className="text-xl font-semibold">
            {stats?.uniqueTipperCount ?? "…"}
          </p>
        </div>
      </div>

      <div>
        <button
          onClick={handleWithdraw}
          disabled={busy || !creator || creator.balance === 0n}
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {state === "signing"
            ? "Confirm in wallet…"
            : state === "mining"
            ? "Withdrawing…"
            : "Withdraw balance"}
        </button>
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {state === "done" && (
          <p className="mt-2 text-sm text-green-700" role="status">
            Withdrawal confirmed.
          </p>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Your tips</h2>
        <TipFeed creatorAddress={account} />
      </div>
    </div>
  );
}
