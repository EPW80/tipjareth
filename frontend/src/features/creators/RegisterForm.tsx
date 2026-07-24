import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../hooks/api/useApi";
import { useRegisterCreator } from "../../hooks/web3/useTipJar";
import { useWallet } from "../../hooks/web3/WalletProvider";
import { friendlyChainError } from "../../lib/errors";

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
      setError(err instanceof Error && err.message.includes("already") ? err.message : friendlyChainError(err));
    }
  }

  if (!account) {
    return (
      <div className="text-center">
        <p className="mb-4 text-slate-600">Connect your wallet to register as a creator.</p>
        <button
          onClick={() => connect()}
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Connect wallet
        </button>
      </div>
    );
  }

  const busy = state === "signing" || state === "mining";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Become a creator</h1>

      <label className="block text-sm">
        Username
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          aria-label="Username"
        />
        {username && !usernameValid && (
          <span className="text-xs text-red-600">
            3–30 characters: letters, numbers, underscore.
          </span>
        )}
      </label>

      <label className="block text-sm">
        Bio (optional)
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={3}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {wrongNetwork && (
        <p className="text-sm text-amber-700">Switch to the local Hardhat network first.</p>
      )}

      <button
        type="submit"
        disabled={busy || !usernameValid || wrongNetwork}
        className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {state === "signing"
          ? "Confirm in wallet…"
          : state === "mining"
            ? "Registering on-chain…"
            : "Register"}
      </button>
      <p className="text-xs text-slate-500">
        Registration is an on-chain transaction (gas only, no fee) followed by creating
        your TipFlow profile.
      </p>
    </form>
  );
}
