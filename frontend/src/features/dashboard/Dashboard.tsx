import { useState } from "react";
import { ErrorBoundary } from "../../components/shared/ErrorBoundary";
import { CreatorStats } from "../../hooks/api/types";
import { useApi } from "../../hooks/api/useApi";
import { useCreatorOnChain, useWithdraw } from "../../hooks/web3/useTipJar";
import { useWallet } from "../../hooks/web3/WalletProvider";
import { friendlyChainError } from "../../lib/errors";
import { formatEth } from "../../lib/format";
import { TipFeed } from "../tipping/TipFeed";

const statLabel = {
  margin: 0,
  fontSize: 11.5,
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  color: "var(--faint)",
};

const statValue = {
  margin: "8px 0 0",
  fontFamily: "var(--font-mono)",
  fontSize: 22,
  fontWeight: 600,
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="tf-card" style={{ padding: 20 }}>
      <p style={statLabel}>{label}</p>
      <p style={statValue}>{value}</p>
    </div>
  );
}

export function Dashboard() {
  const { account, connect } = useWallet();

  if (!account) {
    return (
      <div
        className="tf-card"
        style={{
          maxWidth: 440,
          margin: "40px auto 0",
          padding: "clamp(22px,6vw,32px)",
          textAlign: "center",
        }}
      >
        <p style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 600 }}>
          Your dashboard
        </p>
        <p style={{ margin: "0 0 18px", fontSize: 14, color: "var(--muted)" }}>
          Connect your wallet to see your earnings and tips.
        </p>
        <button
          type="button"
          onClick={() => connect()}
          className="tf-btn-primary"
          style={{ padding: "12px 18px", fontSize: 14 }}
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
  const { data: stats } = useApi<CreatorStats>(`/api/creators/${account}/stats`);
  const { withdraw, state } = useWithdraw();
  const [error, setError] = useState<string | null>(null);

  if (creator && !creator.isActive) {
    return (
      <p style={{ color: "var(--muted)" }}>
        This wallet isn't registered as a creator yet. Head to "Become a creator"
        to register.
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
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(24px,6vw,28px)",
            lineHeight: 1.25,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Dashboard
        </h1>
        {creator && (
          <span style={{ fontSize: 15, color: "var(--muted)" }}>@{creator.username}</span>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit,minmax(min(220px,100%),1fr))",
        }}
      >
        <StatCard
          label="Available to withdraw"
          value={creator ? formatEth(creator.balance) : "…"}
        />
        <StatCard
          label="Total received"
          value={creator ? formatEth(creator.totalReceived) : "…"}
        />
        <StatCard label="Unique tippers" value={stats?.uniqueTipperCount ?? "…"} />
      </div>

      <div>
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={busy || !creator || creator.balance === 0n}
          className="tf-btn-primary"
          style={{ padding: "13px 18px", fontSize: 14 }}
        >
          {state === "signing"
            ? "Confirm in wallet…"
            : state === "mining"
              ? "Withdrawing…"
              : "Withdraw balance"}
        </button>
        <p style={{ margin: "9px 0 0", fontSize: 12.5, color: "var(--faint)" }}>
          Withdraw anytime, straight to your wallet. No withdrawal fee — you pay
          network gas only.
        </p>
        {error && (
          <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "var(--danger)" }} role="alert">
            {error}
          </p>
        )}
        {state === "done" && (
          <p
            style={{ margin: "8px 0 0", fontSize: 13.5, color: "var(--green)", fontWeight: 500 }}
            role="status"
          >
            Withdrawal confirmed.
          </p>
        )}
      </div>

      <div>
        <h2
          style={{
            margin: "0 0 12px",
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Your tips
        </h2>
        <TipFeed
          creatorAddress={account}
          emptyMessage="No tips yet. Share your profile link to get started."
        />
      </div>
    </div>
  );
}
