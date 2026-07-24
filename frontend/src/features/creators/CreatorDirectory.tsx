import { Link } from "react-router-dom";
import { useApi } from "../../hooks/api/useApi";
import { CreatorProfile, Paginated } from "../../hooks/api/types";
import { formatEth, shortAddress } from "../../lib/format";

export function CreatorDirectory() {
  const { data, loading, error } = useApi<Paginated<CreatorProfile>>("/api/creators");

  if (loading) return <p className="text-slate-500">Loading creators…</p>;
  if (error) return <p className="text-red-600">Couldn't load creators: {error}</p>;
  if (!data || data.items.length === 0) {
    return (
      <div className="text-center text-slate-500">
        <p>No creators yet.</p>
        <Link to="/register" className="text-indigo-600 hover:underline">
          Be the first to register
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Creators</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        {data.items.map((c) => (
          <li key={c._id} className="rounded-lg border border-slate-200 bg-white p-4">
            <Link
              to={`/creators/${c.walletAddress}`}
              className="text-lg font-semibold text-indigo-600 hover:underline"
            >
              @{c.username}
            </Link>
            <p className="font-mono text-xs text-slate-400">{shortAddress(c.walletAddress)}</p>
            {c.bio && <p className="mt-2 text-sm text-slate-600">{c.bio}</p>}
            <p className="mt-2 text-xs text-slate-500">
              {c.stats.tipCount} tips · {formatEth(c.stats.totalReceivedWei)} received
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
