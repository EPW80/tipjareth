import { useParams } from "react-router-dom";
import { ErrorBoundary } from "../../components/shared/ErrorBoundary";
import { CreatorProfile as CreatorProfileType } from "../../hooks/api/types";
import { useApi } from "../../hooks/api/useApi";
import { formatEth, shortAddress } from "../../lib/format";
import { TipFeed } from "../tipping/TipFeed";
import { TipForm } from "../tipping/TipForm";

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

  if (loading) return <p className="text-slate-500">Loading creator…</p>;
  if (error || !creator)
    return <p className="text-red-600">Creator not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">@{creator.username}</h1>
        <p className="font-mono text-xs text-slate-400">
          {shortAddress(creator.walletAddress)}
        </p>
        {creator.bio && <p className="mt-2 text-slate-600">{creator.bio}</p>}
        <p className="mt-2 text-sm text-slate-500">
          {creator.stats.tipCount} tips ·{" "}
          {formatEth(creator.stats.totalReceivedWei)} received
        </p>
      </div>

      <ErrorBoundary>
        <TipForm
          creatorAddress={creator.walletAddress}
          creatorName={creator.username}
          onTipped={refetch}
        />
      </ErrorBoundary>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Recent tips</h2>
        <TipFeed creatorAddress={creator.walletAddress} />
      </div>
    </div>
  );
}
