# Handoff: TipFlow Premium-Fintech Restyle

## Overview
A full visual redesign ("premium fintech" direction — clean, confident, restrained, no dark patterns) of the TipFlow creator-tipping app in `EPW80/tipjareth` (branch `feat/tipflow-mvp`). Same features and routes as today, new skin: all 4 screens (creator directory, creator profile with tip form + feed, register, dashboard), responsive/mobile-first, with light and dark themes.

## About the Design Files
The files in this bundle are **design references created in HTML** — interactive prototypes showing intended look and behavior, not production code to copy directly. The task is to **recreate these designs in the existing codebase**: React 18 + TypeScript + Vite + **Tailwind CSS v4** + react-router + ethers v6 (no wagwi/@tanstack per repo dependency policy). Keep the existing component structure (`Layout.tsx`, `CreatorDirectory.tsx`, `CreatorProfile.tsx`, `RegisterForm.tsx`, `Dashboard.tsx`, `TipForm.tsx`, `TipFeed.tsx`) and hooks untouched; only markup/classes and copy change. Express the design tokens below as Tailwind theme variables in `index.css` (`@theme` block in Tailwind v4).

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, states, and copy are final. Recreate pixel-perfectly with Tailwind utilities mapped to the tokens below.

## Design Tokens
Implement as CSS custom properties on `body`, switched by `body[data-theme="dark"]` (also set `color-scheme: dark`). Values: `light / dark`.

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| --bg | #f6f6f3 | #0f1013 | page background |
| --surface | #ffffff | #191b1f | header, footer, cards |
| --ink | #14161a | #f2f3f5 | primary text |
| --muted | #5f6672 | #a2a8b3 | secondary text, inactive nav |
| --faint | #9aa0aa | #7c828d | tertiary text, placeholders, addresses |
| --line | #e7e7e2 | #2a2d33 | hairline borders |
| --line2 | #f0f0ec | #26292e | inner card dividers |
| --inputBorder | #d8d8d2 | #3a3e46 | input borders, dashed empty-states |
| --inputbg | #ffffff | #131519 | input backgrounds |
| --well | #f6f6f3 | #22252b | fee-breakdown box, input suffix |
| --btn | #14161a | #f2f3f5 | primary button bg, logo tile, checkbox accent |
| --btnHover | #2a2d33 | #d7dae0 | primary button hover |
| --btnText | #ffffff | #101114 | primary button text |
| --accent | #3f45d6 | #8b90f0 | links, avatar initials, input focus ring |
| --accentHover | #2f34a8 | #a6aaf5 | link hover |
| --chipBg | #eef0f4 | #262b36 | avatar circle bg |
| --green | #1a7a4b | #4ecb8d | success text, tip amounts (+0.05 ETH) |
| --dotGreen | #1a9a5c | #2ecc7a | connected-status dot |
| --danger | #c23b3b | #e06c6c | validation/error text |
| --amberBg | #faf3e3 | #2e2717 | warning banner/badge bg |
| --amberLine | #ecdfc0 | #4a3d1f | warning border |
| --amberText | #8a6420 | #d9b45c | warning text |
| --cardHoverLine | #c9cbd4 | #3d4149 | directory card hover border |

Other values:
- Focus ring: `border-color: var(--accent); box-shadow: 0 0 0 3px rgba(63,69,214,0.12)`.
- Card shadow: `0 1px 2px rgba(20,22,26,0.04)`; directory card hover: `0 3px 10px rgba(20,22,26,0.07)`.
- Radii: cards 12px, tip-feed rows 10px, buttons/inputs 8px, avatar circles 50%, pills/chips 999px, logo tile 8px.
- Spacing: card padding clamp(18px,5vw,24px); grid gaps 14px (cards) / 10px (feed rows) / 24px (page sections); page gutter clamp(16px,4.5vw,20px); main top padding clamp(28px,6vw,44px), bottom 72px; content max-width 960px.

## Typography
- UI font: **"Instrument Sans"** (Google Fonts, 400/500/600/700), fallback `system-ui, sans-serif`.
- Numeric/address font: **"IBM Plex Mono"** (400/500/600) — used for ALL wallet addresses, ETH amounts, stat values, the Ξ logo glyph, and the amount input.
- Scale: page h1 clamp(24px,6vw,28px)/1.25, 700, letter-spacing -0.02em; profile h1 24px; card titles 17px/600; register h1 22px/700; body 14–15px; helper/footnotes 11.5–13px; section headings ("Recent tips", "Your tips") 12.5px, 600, uppercase, letter-spacing 0.05em, color --muted; stat labels 11.5px, 600, uppercase, 0.06em, --faint; stat values 22px mono 600.
- Inputs and textareas use 16px font (prevents iOS focus zoom).

## Screens / Views

### Shell (all screens) — replaces `Layout.tsx`
- Sticky header, `--surface` bg, 1px `--line` bottom border. Two rows, 960px centered:
  - Row 1 (justify-between): brand (28px `--btn` tile, radius 8, white mono "Ξ" + "TipFlow" 16px/700, -0.01em) — links to `/`; right side = wallet slot (see Wallet states).
  - Row 2: tab nav, `overflow-x:auto`, gap 24px, 14px/500 links: Creators `/`, Become a creator `/register`, Dashboard `/dashboard`. Active: `--ink` text + 2px `--ink` bottom border (padding 10px 0 12px); inactive: `--muted`, hover `--ink`. Links `white-space:nowrap`.
- Wrong-network banner below nav: `--amberBg`, 1px `--amberLine` top border, centered 13.5px `--amberText`: "Your wallet is on the wrong network. Switch to the local Hardhat chain (31337) to continue."
- Footer: `--surface`, 1px `--line` top border, 12.5px `--faint`, flex-wrap justify-between: "TipFlow — tips settle on-chain, verified before they appear." / mono "Hardhat · chain 31337".

### Creator directory (`/`) — `CreatorDirectory.tsx`
- H1 "Creators" + subtitle 15px `--muted`: "Tips go straight to each creator's wallet. One flat 2.5% platform fee, always shown before you send." (28px block margin below.)
- Grid `repeat(auto-fill, minmax(min(280px,100%),1fr))`, gap 14px. Card (whole card clickable → profile): 12px radius, 1px `--line`, `--surface`, padding 20px, card shadow; hover raises border to `--cardHoverLine` + hover shadow (transition .15s).
  - Header row: 40px avatar circle (`--chipBg` bg, `--accent` 16px/600 uppercase initial) + @username 16px/600 + address 11.5px mono `--faint` (short form `0x71C7…976F`).
  - Bio 14px/20px `--muted`, margin-top 12px.
  - Stats row: margin-top 14px, padding-top 12px, 1px `--line2` top border; "128 tips · 3.4210 ETH received" — numbers mono 500 `--ink`, labels 12.5px `--muted`, gap 16px.
- Empty state: dashed 1px `--inputBorder` box, radius 12, centered, padding 56px 24px: "No creators yet" (16px/600), "TipFlow is brand new here. Claim your username first." (14px `--muted`), primary button "Become a creator".

### Creator profile (`/creators/:walletAddress`) — `CreatorProfile.tsx` + `TipForm.tsx` + `TipFeed.tsx`
- Profile card: 56px avatar + h1 "@username" + FULL address 12px mono `--faint`; bio 15px/22px `--muted`; stats row as directory but 13px/gap 24px, above `--line2` divider.
- Below: 2-col grid `repeat(auto-fit, minmax(min(320px,100%),1fr))`, gap 24px, `align-items:start` (stacks on mobile).
- **Tip form card** ("Send a tip" 17px/600, sub "Goes directly to @name's wallet." 13px `--muted`; grid gap 18px):
  - Amount: labeled 13.5px/500; group = mono 16px input + "ETH" suffix cell (`--well` bg, 1px `--line` left border, 13px/500 `--muted`), 1px `--inputBorder`, radius 8.
  - Message (optional): textarea rows=2, maxLength 280, placeholder "Say something nice — it shows on their profile".
  - Anonymous checkbox (accent-color `--btn`): "Don't show my name with this tip" + 12px `--faint` subtext: "Hides your address on TipFlow only — it stays publicly visible on the blockchain."
  - Fee breakdown (always visible when amount valid; `--well` bg, radius 8, padding 14px, 13px): row "Platform fee (2.50%)" (`--muted`) / mono value; row "@name receives" 600 / mono value; footnote 11.5px `--faint`: "You'll confirm the exact total in your wallet before anything is sent." Fee % and min tip come from the contract (`platformFeeBps`, `minTipWei`) — 2.50% is the demo value.
  - Validation copy: "Enter an amount." / "That doesn't look like a valid amount." / "The minimum tip is 0.0001 ETH." in `--danger` 13.5px.
  - Submit: full-width primary button, labels by tx state: idle "Send tip" / signing "Confirm in your wallet…" / mining "Waiting for confirmation…"; success line `--green` 13.5px/500: "Tip confirmed — thank you for supporting @name."
- **Recent tips** column: uppercase section heading; rows radius 10, padding 14px 16px: address (or "Anonymous") 12px mono `--faint` left, amount right as mono 13px/600 `--green` with `+` prefix ("+0.05 ETH"); message 14px/20px `--ink` below. Empty: dashed box "No tips yet. Yours could be the first."

### Register (`/register`) — `RegisterForm.tsx`
- Single centered card, max-width 440px, padding clamp(20px,5vw,28px), grid gap 18px.
- H1 "Become a creator" 22px/700 + sub "Claim a username and start receiving tips directly to your wallet."
- Username (placeholder "your_handle"; live rule 3–30 chars `[a-zA-Z0-9_]`, error 12px `--danger`: "3–30 characters: letters, numbers, underscore."), Bio optional (rows=3, placeholder "What do you make?", maxLength 500).
- Full-width primary "Register"; button states: "Confirm in wallet…" / "Registering on-chain…".
- Footnote 12px `--faint`: "Registering is a one-time on-chain transaction. You pay network gas only — TipFlow charges nothing to join."

### Dashboard (`/dashboard`) — `Dashboard.tsx`
- Title row: "Dashboard" h1 + "@username" 15px `--muted`, baseline-aligned, wraps.
- 3 stat cards, grid `minmax(min(220px,100%),1fr)`, gap 14px, padding 20px: uppercase label ("Available to withdraw" / "Total received" / "Unique tippers") + mono 22px/600 value, 8px apart.
- "Withdraw balance" primary button (disabled when balance is 0 or tx busy; labels "Confirm in wallet…" / "Withdrawing…"); helper 12.5px `--faint`: "Withdraw anytime, straight to your wallet. No withdrawal fee — you pay network gas only."; success `--green`: "Withdrawal confirmed."
- "Your tips" feed — identical to profile feed. Empty: "No tips yet. Share your profile link to get started."

## Interactions & Behavior
- Primary buttons: `--btn` bg / `--btnText`, hover `--btnHover`, disabled opacity 0.45 (also disabled while wrong-network); min tap height ≥44px (padding 12–13px vertical).
- Inputs: focus = accent border + 3px rgba(63,69,214,0.12) ring, no outline.
- Directory cards: hover border/shadow lift, cursor pointer, whole card navigates.
- Responsive: no media queries needed — fluid `clamp()` paddings/headline, `auto-fill/auto-fit` grids with `min(Npx,100%)`, wrapping flex rows, horizontally scrollable nav.
- Theme: `data-theme="dark"` attribute on `<body>`; persist the choice (e.g. localStorage) and optionally default to `prefers-color-scheme`.

### Wallet states (header slot + per-screen gates)
- **Connected**: pill chip — 1px `--line` border, `--surface`, radius 999px, padding 6px 12px, 7px `--dotGreen` dot + short address 12px mono `--muted`.
- **Disconnected**: primary "Connect wallet" button in header; profile tip form → centered card "Connect a wallet to send @name a tip." + button; register → card "Become a creator / Connect a wallet to claim your username and start receiving tips."; dashboard → card "Your dashboard / Connect your wallet to see your earnings and tips."
- **No wallet detected**: amber pill badge "No wallet detected" (13px, `--amberBg`/`--amberLine`/`--amberText`).
- **Wrong network**: connected chip + amber banner; tip/register/withdraw actions disabled.

## State Management
No new state beyond what exists: `WalletProvider` (account/chainId/wrongNetwork/connecting), `useTipJarInfo` (feeBps, minTipWei), tx state machines (`idle/signing/mining/done`) in `useTipJar.ts`, `useApi` data fetching. Add only: `theme` (light/dark) with persistence.

## Assets
- Google Fonts: Instrument Sans (400–700), IBM Plex Mono (400–600) — load via `<link>` or self-host.
- Logo is pure CSS/text (mono "Ξ" in a rounded tile) — no image assets. Avatars are initial-letter circles (no images in scope).

## Files
- `TipFlow Redesign.dc.html` — the redesign (all 4 screens; interactive nav; tweakable props for theme/wallet/data/tx states). **Source of truth.**
- `TipFlow Current.dc.html` — faithful recreation of today's Tailwind UI, for before/after reference.
- `github.md` — source-repo mapping (screen → repo file).

Copy in this handoff is final and intentionally transparent (fees shown before signing, honest anonymity caveat) — please keep it verbatim.
