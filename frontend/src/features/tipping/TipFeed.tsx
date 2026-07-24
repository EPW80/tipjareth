import { Paginated, TipRecord } from "../../hooks/api/types";
import { useApi } from "../../hooks/api/useApi";
import { formatEth, shortAddress } from "../../lib/format";

export function TipFeed({ creatorAddress }: { creatorAddress: string }) {
  const { data, loading, error } = useApi<Paginated<TipRecord>>(
    `/api/tips?creator=${creatorAddress}`
  );

  if (loading) return <p className="text-slate-500">Loading tips…</p>;
  if (error) return <p className="text-red-600">Couldn't load tips: {error}</p>;
  if (!data || data.items.length === 0)
    return <p className="text-slate-500">No tips yet — be the first!</p>;

  return (
    <ul className="space-y-3">
      {data.items.map((t) => (
        <li key={t._id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
          <div className="flex justify-between">
            <span className="font-mono text-xs text-slate-500">
              {t.isAnonymous || !t.fromAddress ? "Anonymous" : shortAddress(t.fromAddress)}
            </span>
            <span className="font-medium">{formatEth(t.amountWei)}</span>
          </div>
          {t.message && <p className="mt-1 text-slate-700">{t.message}</p>}
        </li>
      ))}
    </ul>
  );
}
