import { Link, NavLink, Outlet } from "react-router-dom";
import { shortAddress } from "../../lib/format";
import { useWallet } from "../../hooks/web3/WalletProvider";
import { useTheme } from "../../hooks/theme/ThemeProvider";

const GUTTER = "clamp(16px,4vw,20px)";

function navTabStyle(isActive: boolean) {
  return {
    padding: "10px 0 12px",
    borderBottom: `2px solid ${isActive ? "var(--ink)" : "transparent"}`,
    color: isActive ? "var(--ink)" : undefined,
    whiteSpace: "nowrap" as const,
    flex: "none" as const,
    fontWeight: 500,
  };
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      className="tf-icon-btn"
      style={{ width: 34, height: 34 }}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

function WalletSlot() {
  const { account, hasWallet, connecting, connect } = useWallet();

  if (!hasWallet) {
    return (
      <span
        style={{
          border: "1px solid var(--amberLine)",
          background: "var(--amberBg)",
          color: "var(--amberText)",
          borderRadius: 999,
          padding: "6px 12px",
          fontSize: 13,
          whiteSpace: "nowrap",
        }}
      >
        No wallet detected
      </span>
    );
  }

  if (account) {
    return (
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          border: "1px solid var(--line)",
          background: "var(--surface)",
          borderRadius: 999,
          padding: "6px 12px",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--dotGreen)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          {shortAddress(account)}
        </span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => connect()}
      disabled={connecting}
      className="tf-btn-primary"
      style={{ padding: "10px 16px", fontSize: 13.5 }}
    >
      {connecting ? "Connecting…" : "Connect wallet"}
    </button>
  );
}

export function Layout() {
  const { wrongNetwork } = useWallet();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--line)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: `12px ${GUTTER} 2px`,
          }}
        >
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              color: "var(--ink)",
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "var(--btn)",
                color: "var(--btnText)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Ξ
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>
              TipFlow
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 36 }}>
            <WalletSlot />
            <ThemeToggle />
          </div>
        </div>
        <nav
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: `0 ${GUTTER}`,
            display: "flex",
            gap: 24,
            fontSize: 14,
            overflowX: "auto",
          }}
        >
          <NavLink to="/" end className="tf-nav-tab" style={({ isActive }) => navTabStyle(isActive)}>
            Creators
          </NavLink>
          <NavLink to="/register" className="tf-nav-tab" style={({ isActive }) => navTabStyle(isActive)}>
            Become a creator
          </NavLink>
          <NavLink to="/dashboard" className="tf-nav-tab" style={({ isActive }) => navTabStyle(isActive)}>
            Dashboard
          </NavLink>
        </nav>
        {wrongNetwork && (
          <div
            style={{
              background: "var(--amberBg)",
              borderTop: "1px solid var(--amberLine)",
              padding: "9px 20px",
              textAlign: "center",
              fontSize: 13.5,
              color: "var(--amberText)",
            }}
          >
            Your wallet is on the wrong network. Switch to the local Hardhat chain
            (31337) to continue.
          </div>
        )}
      </header>

      <main
        style={{
          maxWidth: 960,
          width: "100%",
          margin: "0 auto",
          padding: `clamp(28px,6vw,44px) clamp(16px,4.5vw,20px) 72px`,
          flex: 1,
        }}
      >
        <Outlet />
      </main>

      <footer
        style={{ borderTop: "1px solid var(--line)", background: "var(--surface)" }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: `16px ${GUTTER}`,
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            fontSize: 12.5,
            color: "var(--faint)",
          }}
        >
          <span>TipFlow — tips settle on-chain, verified before they appear.</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>Hardhat · chain 31337</span>
        </div>
      </footer>
    </div>
  );
}
