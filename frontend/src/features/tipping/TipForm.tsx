import { formatEther, parseEther } from "ethers";
import { FormEvent, useState } from "react";
import { friendlyChainError } from "../../lib/errors";
import { useTipCreator, useTipJarInfo } from "../../hooks/web3/useTipJar";
import { useWallet } from "../../hooks/web3/WalletProvider";

interface Props {
  creatorAddress: string;
  creatorName: string;
  onTipped?: () => void;
}

const BPS = 10_000n;

const labelStyle = { display: "block", fontSize: 13.5, fontWeight: 500 } as const;

export function TipForm({ creatorAddress, creatorName, onTipped }: Props) {
  const { account, wrongNetwork, connect } = useWallet();
  const { feeBps, minTipWei } = useTipJarInfo();
  const { tip, state } = useTipCreator();

  const [amount, setAmount] = useState("0.01");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  let amountWei: bigint | null = null;
  try {
    amountWei = amount ? parseEther(amount) : null;
  } catch {
    amountWei = null;
  }

  const belowMin =
    amountWei !== null && minTipWei !== null && amountWei < minTipWei;
  const feeWei =
    amountWei !== null && feeBps !== null ? (amountWei * feeBps) / BPS : null;

  const validationError = !amount
    ? "Enter an amount."
    : amountWei === null
      ? "That doesn't look like a valid amount."
      : belowMin
        ? `The minimum tip is ${formatEther(minTipWei!)} ETH.`
        : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (validationError || feeBps === null) return;
    try {
      await tip({
        creatorAddress,
        amountEth: amount,
        message,
        isAnonymous,
        displayedFeeBps: feeBps,
      });
      setSuccess(true);
      setMessage("");
      onTipped?.();
    } catch (err) {
      setError(friendlyChainError(err));
    }
  }

  if (!account) {
    return (
      <div className="tf-card" style={{ padding: "clamp(18px,5vw,24px)", textAlign: "center" }}>
        <p style={{ margin: "0 0 14px", fontSize: 14, color: "var(--muted)" }}>
          Connect a wallet to send @{creatorName} a tip.
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
    <form
      onSubmit={handleSubmit}
      className="tf-card"
      style={{ display: "grid", gap: 18, padding: "clamp(18px,5vw,24px)", margin: 0 }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Send a tip</h2>
        <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--muted)" }}>
          Goes directly to @{creatorName}'s wallet.
        </p>
      </div>

      <label style={labelStyle}>
        Amount
        <span
          className="tf-field-group"
          style={{
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            border: "1px solid var(--inputBorder)",
            borderRadius: 8,
            background: "var(--inputbg)",
            overflow: "hidden",
          }}
        >
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="tf-bare-input"
            aria-label="Amount in ETH"
            style={{
              flex: 1,
              border: "none",
              padding: "10px 12px",
              fontFamily: "var(--font-mono)",
              fontSize: 16,
              minWidth: 0,
              background: "transparent",
            }}
          />
          <span
            style={{
              padding: "10px 12px",
              background: "var(--well)",
              borderLeft: "1px solid var(--line)",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--muted)",
            }}
          >
            ETH
          </span>
        </span>
      </label>

      <label style={labelStyle}>
        Message <span style={{ fontWeight: 400, color: "var(--faint)" }}>(optional)</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={280}
          rows={2}
          placeholder="Say something nice — it shows on their profile"
          className="tf-field"
          aria-label="Tip message"
          style={{
            marginTop: 6,
            width: "100%",
            borderRadius: 8,
            border: "1px solid var(--inputBorder)",
            padding: "10px 12px",
            display: "block",
            resize: "vertical",
            fontSize: 16,
          }}
        />
      </label>

      <label style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13.5, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          style={{ marginTop: 2, accentColor: "var(--btn)" }}
        />
        <span style={{ fontWeight: 500 }}>
          Don't show my name with this tip
          <span
            style={{
              display: "block",
              marginTop: 2,
              fontSize: 12,
              fontWeight: 400,
              lineHeight: "17px",
              color: "var(--faint)",
            }}
          >
            Hides your address on TipFlow only — it stays publicly visible on the
            blockchain.
          </span>
        </span>
      </label>

      {/* fee transparency: full breakdown before the user signs */}
      {amountWei !== null && feeWei !== null && !belowMin && (
        <div
          data-testid="fee-breakdown"
          style={{
            borderRadius: 8,
            background: "var(--well)",
            padding: 14,
            fontSize: 13,
            display: "grid",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
            <span>Platform fee ({(Number(feeBps) / 100).toFixed(2)}%)</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>{formatEther(feeWei)} ETH</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
            <span>@{creatorName} receives</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>
              {formatEther(amountWei - feeWei)} ETH
            </span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--faint)" }}>
            You'll confirm the exact total in your wallet before anything is sent.
          </p>
        </div>
      )}

      {validationError && amount && (
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--danger)" }} role="alert">
          {validationError}
        </p>
      )}
      {error && (
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--danger)" }} role="alert">
          {error}
        </p>
      )}
      {success && (
        <p
          style={{ margin: 0, fontSize: 13.5, color: "var(--green)", fontWeight: 500 }}
          role="status"
        >
          Tip confirmed — thank you for supporting @{creatorName}.
        </p>
      )}
      {wrongNetwork && (
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--amberText)" }}>
          Switch to the local Hardhat network to tip.
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !!validationError || wrongNetwork || feeBps === null}
        className="tf-btn-primary"
        style={{ width: "100%", padding: "13px 16px", fontSize: 14 }}
      >
        {state === "signing"
          ? "Confirm in your wallet…"
          : state === "mining"
            ? "Waiting for confirmation…"
            : "Send tip"}
      </button>
    </form>
  );
}
