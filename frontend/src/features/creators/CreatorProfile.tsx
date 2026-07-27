import { useParams } from "react-router-dom";
import { ErrorBoundary } from "../../components/shared/ErrorBoundary";
import { CreatorProfile as CreatorProfileType } from "../../hooks/api/types";
import { useApi } from "../../hooks/api/useApi";
import { formatEth } from "../../lib/format";
import { TipFeed } from "../tipping/TipFeed";
import { TipForm } from "../tipping/TipForm";

const sectionHeading = {
  margin: "0 0 12px",
  fontSize: 12.5,
  fontWeight: 600,
  color: "var(--muted)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

export function CreatorProfile() {
  const { walletAddress = "" } = useParams();
  const {
    data: creator,
    loading,
    error,
    refetch,
  } = useApi<CreatorProfileType>(
    walletAddress ? `/api/creators/${walletAddress}` : null,
  );

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading creator…</p>;
  if (error || !creator)
    return <p style={{ color: "var(--danger)" }}>Creator not found.</p>;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div className="tf-card" style={{ padding: "clamp(18px,5vw,24px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--chipBg)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 22,
              flex: "none",
            }}
          >
            {creator.username.charAt(0).toUpperCase()}
          </span>
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                lineHeight: "30px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              @{creator.username}
            </h1>
            <p
              style={{
                margin: "3px 0 0",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--faint)",
                wordBreak: "break-all",
              }}
            >
              {creator.walletAddress}
            </p>
          </div>
        </div>
        {creator.bio && (
          <p
            style={{
              margin: "16px 0 0",
              fontSize: 15,
              lineHeight: "22px",
              color: "var(--muted)",
            }}
          >
            {creator.bio}
          </p>
        )}
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid var(--line2)",
            display: "flex",
            gap: 24,
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          <span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--ink)" }}>
              {creator.stats.tipCount}
            </span>{" "}
            tips
          </span>
          <span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--ink)" }}>
              {formatEth(creator.stats.totalReceivedWei)}
            </span>{" "}
            received
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 24,
          gridTemplateColumns: "repeat(auto-fit,minmax(min(320px,100%),1fr))",
          alignItems: "start",
        }}
      >
        <div>
          <ErrorBoundary>
            <TipForm
              creatorAddress={creator.walletAddress}
              creatorName={creator.username}
              onTipped={refetch}
            />
          </ErrorBoundary>
        </div>

        <div>
          <h2 style={sectionHeading}>Recent tips</h2>
          <TipFeed creatorAddress={creator.walletAddress} />
        </div>
      </div>
    </div>
  );
}
