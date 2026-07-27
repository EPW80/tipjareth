import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/api/useApi";
import { CreatorProfile, Paginated } from "../../hooks/api/types";
import { formatEth, shortAddress } from "../../lib/format";

export function CreatorDirectory() {
  const navigate = useNavigate();
  const { data, loading, error } =
    useApi<Paginated<CreatorProfile>>("/api/creators");

  if (loading)
    return <p style={{ color: "var(--muted)" }}>Loading creators…</p>;
  if (error)
    return <p style={{ color: "var(--danger)" }}>Couldn't load creators: {error}</p>;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(24px,6vw,28px)",
            lineHeight: 1.25,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Creators
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 15, color: "var(--muted)" }}>
          Tips go straight to each creator's wallet. One flat 2.5% platform fee,
          always shown before you send.
        </p>
      </div>

      {!data || data.items.length === 0 ? (
        <div
          style={{
            border: "1px dashed var(--inputBorder)",
            borderRadius: 12,
            padding: "56px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>No creators yet</p>
          <p style={{ margin: "6px 0 18px", fontSize: 14, color: "var(--muted)" }}>
            TipFlow is brand new here. Claim your username first.
          </p>
          <Link
            to="/register"
            className="tf-btn-primary"
            style={{
              display: "inline-block",
              padding: "12px 18px",
              fontSize: 14,
            }}
          >
            Become a creator
          </Link>
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fill,minmax(min(280px,100%),1fr))",
          }}
        >
          {data.items.map((c) => (
            <li
              key={c._id}
              onClick={() => navigate(`/creators/${c.walletAddress}`)}
              className="tf-card tf-card-link"
              style={{ padding: 20 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--chipBg)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: 16,
                    flex: "none",
                  }}
                >
                  {c.username.charAt(0).toUpperCase()}
                </span>
                <div style={{ minWidth: 0 }}>
                  <Link
                    to={`/creators/${c.walletAddress}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}
                  >
                    @{c.username}
                  </Link>
                  <p
                    style={{
                      margin: "1px 0 0",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11.5,
                      color: "var(--faint)",
                    }}
                  >
                    {shortAddress(c.walletAddress)}
                  </p>
                </div>
              </div>
              {c.bio && (
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: 14,
                    lineHeight: "20px",
                    color: "var(--muted)",
                  }}
                >
                  {c.bio}
                </p>
              )}
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: "1px solid var(--line2)",
                  display: "flex",
                  gap: 16,
                  fontSize: 12.5,
                  color: "var(--muted)",
                }}
              >
                <span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 500,
                      color: "var(--ink)",
                    }}
                  >
                    {c.stats.tipCount}
                  </span>{" "}
                  tips
                </span>
                <span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 500,
                      color: "var(--ink)",
                    }}
                  >
                    {formatEth(c.stats.totalReceivedWei)}
                  </span>{" "}
                  received
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
