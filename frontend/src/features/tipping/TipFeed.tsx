import { Paginated, TipRecord } from "../../hooks/api/types";
import { useApi } from "../../hooks/api/useApi";
import { formatEth, shortAddress } from "../../lib/format";

interface Props {
  creatorAddress: string;
  emptyMessage?: string;
}

export function TipFeed({
  creatorAddress,
  emptyMessage = "No tips yet. Yours could be the first.",
}: Props) {
  const { data, loading, error } = useApi<Paginated<TipRecord>>(
    `/api/tips?creator=${creatorAddress}`,
  );

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading tips…</p>;
  if (error)
    return <p style={{ color: "var(--danger)" }}>Couldn't load tips: {error}</p>;
  if (!data || data.items.length === 0)
    return (
      <div
        style={{
          border: "1px dashed var(--inputBorder)",
          borderRadius: 10,
          padding: "28px 16px",
          textAlign: "center",
          fontSize: 13.5,
          color: "var(--faint)",
        }}
      >
        {emptyMessage}
      </div>
    );

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
      {data.items.map((t) => (
        <li
          key={t._id}
          className="tf-card"
          style={{ padding: "14px 16px", boxShadow: "none" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--faint)",
              }}
            >
              {t.isAnonymous || !t.fromAddress
                ? "Anonymous"
                : shortAddress(t.fromAddress)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--green)",
              }}
            >
              +{formatEth(t.amountWei)}
            </span>
          </div>
          {t.message && (
            <p
              style={{
                margin: "7px 0 0",
                fontSize: 14,
                lineHeight: "20px",
                color: "var(--ink)",
              }}
            >
              {t.message}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
