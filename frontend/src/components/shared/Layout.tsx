import { Link, NavLink, Outlet } from "react-router-dom";
import { shortAddress } from "../../lib/format";
import { useWallet } from "../../hooks/web3/WalletProvider";

export function Layout() {
  const { account, hasWallet, wrongNetwork, connecting, connect } = useWallet();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-indigo-600">
            TipFlow
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink to="/" className="hover:text-indigo-600">
              Creators
            </NavLink>
            <NavLink to="/register" className="hover:text-indigo-600">
              Become a creator
            </NavLink>
            <NavLink to="/dashboard" className="hover:text-indigo-600">
              Dashboard
            </NavLink>
            {!hasWallet ? (
              <span className="rounded bg-amber-100 px-2 py-1 text-amber-800">
                No wallet detected
              </span>
            ) : account ? (
              <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs">
                {shortAddress(account)}
              </span>
            ) : (
              <button
                onClick={() => connect()}
                disabled={connecting}
                className="rounded bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {connecting ? "Connecting…" : "Connect wallet"}
              </button>
            )}
          </nav>
        </div>
        {wrongNetwork && (
          <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
            Wrong network — switch your wallet to the local Hardhat chain (31337).
          </div>
        )}
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
