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
    ? "Enter an amount"
    : amountWei === null
    ? "Invalid amount"
    : belowMin
    ? `Minimum tip is ${formatEther(minTipWei!)} ETH`
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
      <button
        onClick={() => connect()}
        className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
      >
        Connect wallet to tip @{creatorName}
      </button>
    );
  }

  const busy = state === "signing" || state === "mining";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      <h2 className="font-semibold">Tip @{creatorName}</h2>

      <label className="block text-sm">
        Amount (ETH)
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          aria-label="Amount in ETH"
        />
      </label>

      <label className="block text-sm">
        Message (optional)
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={280}
          rows={2}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          aria-label="Tip message"
        />
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Don't show my name with this tip
          <span className="block text-xs text-slate-500">
            Hides your address in TipFlow only — your wallet address remains
            publicly visible on the blockchain.
          </span>
        </span>
      </label>

      {/* fee transparency: full breakdown before the user signs */}
      {amountWei !== null && feeWei !== null && !belowMin && (
        <div
          className="rounded bg-slate-50 p-3 text-xs text-slate-600"
          data-testid="fee-breakdown"
        >
          <div className="flex justify-between">
            <span>Platform fee ({(Number(feeBps) / 100).toFixed(2)}%)</span>
            <span>{formatEther(feeWei)} ETH</span>
          </div>
          <div className="flex justify-between font-medium text-slate-800">
            <span>@{creatorName} receives</span>
            <span>{formatEther(amountWei - feeWei)} ETH</span>
          </div>
        </div>
      )}

      {validationError && amount && (
        <p className="text-sm text-red-600" role="alert">
          {validationError}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700" role="status">
          Tip confirmed — thank you!
        </p>
      )}
      {wrongNetwork && (
        <p className="text-sm text-amber-700">
          Switch to the local Hardhat network to tip.
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !!validationError || wrongNetwork || feeBps === null}
        className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {state === "signing"
          ? "Confirm in wallet…"
          : state === "mining"
          ? "Waiting for confirmation…"
          : "Send tip"}
      </button>
    </form>
  );
}
