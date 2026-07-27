import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../hooks/api/useApi";
import { useRegisterCreator } from "../../hooks/web3/useTipJar";
import { useWallet } from "../../hooks/web3/WalletProvider";
import { friendlyChainError } from "../../lib/errors";

const cardBase = {
  maxWidth: 440,
  margin: "0 auto",
  padding: "clamp(20px,5vw,28px)",
} as const;

const labelStyle = { display: "block", fontSize: 13.5, fontWeight: 500 } as const;

const fieldStyle = {
  marginTop: 6,
  width: "100%",
  borderRadius: 8,
  border: "1px solid var(--inputBorder)",
  padding: "10px 12px",
  display: "block",
  fontSize: 16,
} as const;

export function RegisterForm() {
  const { account, connect, wrongNetwork } = useWallet();
  const { register, state } = useRegisterCreator();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);

  const usernameValid = /^[a-zA-Z0-9_]{3,30}$/.test(username);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!account || !usernameValid) return;
    try {
      await register(username); // on-chain first
      await apiFetch("/api/creators", {
        method: "POST",
        body: JSON.stringify({ walletAddress: account, username, bio }),
      });
      navigate(`/creators/${account}`);
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("already")
          ? err.message
          : friendlyChainError(err),
      );
    }
  }

  if (!account) {
    return (
      <div
        className="tf-card"
        style={{ ...cardBase, marginTop: 40, textAlign: "center", padding: "clamp(22px,6vw,32px)" }}
      >
        <p style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 600 }}>
          Become a creator
        </p>
        <p style={{ margin: "0 0 18px", fontSize: 14, color: "var(--muted)" }}>
          Connect a wallet to claim your username and start receiving tips.
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

  const busy = state === "signing" || state === "mining";

  return (
    <form onSubmit={handleSubmit} className="tf-card" style={{ ...cardBase, display: "grid", gap: 18 }}>
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            lineHeight: "28px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Become a creator
        </h1>
        <p style={{ margin: "5px 0 0", fontSize: 14, color: "var(--muted)" }}>
          Claim a username and start receiving tips directly to your wallet.
        </p>
      </div>

      <label style={labelStyle}>
        Username
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your_handle"
          className="tf-field"
          aria-label="Username"
          style={fieldStyle}
        />
        {username && !usernameValid && (
          <span style={{ display: "block", marginTop: 5, fontSize: 12, color: "var(--danger)" }}>
            3–30 characters: letters, numbers, underscore.
          </span>
        )}
      </label>

      <label style={labelStyle}>
        Bio <span style={{ fontWeight: 400, color: "var(--faint)" }}>(optional)</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="What do you make?"
          className="tf-field"
          style={{ ...fieldStyle, resize: "vertical" }}
        />
      </label>

      {error && (
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--danger)" }} role="alert">
          {error}
        </p>
      )}
      {wrongNetwork && (
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--amberText)" }}>
          Switch to the local Hardhat network first.
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !usernameValid || wrongNetwork}
        className="tf-btn-primary"
        style={{ width: "100%", padding: "13px 16px", fontSize: 14 }}
      >
        {state === "signing"
          ? "Confirm in wallet…"
          : state === "mining"
            ? "Registering on-chain…"
            : "Register"}
      </button>
      <p style={{ margin: 0, fontSize: 12, lineHeight: "17px", color: "var(--faint)" }}>
        Registering is a one-time on-chain transaction. You pay network gas only —
        TipFlow charges nothing to join.
      </p>
    </form>
  );
}
