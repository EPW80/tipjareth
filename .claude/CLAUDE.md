# TipFlow - Creator Tip Platform

**Stack:** Solidity ^0.8.24 + Hardhat + OpenZeppelin 5 | Express + TypeScript + MongoDB (Mongoose 8) | React 18 + Vite + Tailwind | ethers v6 everywhere

## Project Structure

```
tipjareth/
├── contracts/          # Hardhat project: TipJar.sol + tests + deploy
├── backend/            # Express API + Mongoose + on-chain verification
├── frontend/           # React + TS + Vite + Tailwind
├── config/             # addresses.json - single source of truth for contract addresses
└── docs/               # Guides + original starter-kit reference
```

## Commands (run from repo root)

- `npm run dev` - Start all services (hardhat node :8545 + backend :5000 + frontend :5173)
- `npm run deploy:local` - Deploy contracts, writes config/addresses.json
- `npm run db:seed` - Seed creators (on-chain + Mongo)
- `npm run test` / `test:contracts` / `test:backend` / `test:frontend`
- `npm run build` - Compile contracts + build backend + frontend

## Dependency Rules

IMPORTANT: Never add @tanstack/* packages, wagmi, or RainbowKit (supply-chain policy).
Web3 is ethers v6 only. API fetching is plain `fetch` via custom hooks in `frontend/src/hooks/api/`.

## No Dark Patterns

IMPORTANT: All fees shown to the user BEFORE they sign; tipCreator takes `acceptedMaxFeeBps`
so a fee change can never silently apply. The "anonymous" toggle must state that the wallet
address remains public on-chain. No pre-checked options, no confirmshaming, no fake urgency,
no hidden costs anywhere in the UI.

## Smart Contracts

**Don't:** Use `tx.origin`, ignore return values, or use require strings
**Do:** Use `msg.sender`, check external calls, use custom errors + events for all state changes

IMPORTANT: Reentrancy guards on all payable/withdraw functions; pull-payment pattern for creator balances
IMPORTANT: >95% test coverage including edge cases (`npx hardhat coverage` in contracts/)

## Backend (Express + MongoDB)

**Don't:** Trust client input, store wei as Numbers, or log sensitive data
**Do:** Verify tips on-chain from the tx receipt's TipReceived event; store wei as strings

Collections: `creators`, `tips` (ObjectId refs). Unique idx: `walletAddress`, `username`, `txHash`.
Rate limit 100 req/min per IP. Validation via express-validator. Winston for logging.

## Frontend (React + TypeScript)

**Don't:** Put Web3 logic in components, trust tx success client-side, or show raw chain errors
**Do:** Keep chain calls in `hooks/web3/` (WalletProvider context), verify via backend, map ethers error codes (ACTION_REJECTED, INSUFFICIENT_FUNDS) to friendly messages

Layout: `features/{tipping,creators,dashboard}`, `components/shared/`, `hooks/{web3,api}`.
Contract addresses come only from `config/addresses.json`; ABI from generated copy step.

IMPORTANT: Update UI only after `tx.wait()` confirms the transaction

## Testing Requirements

- Contracts: Hardhat + chai, >95% coverage
- Backend: vitest + supertest + mongodb-memory-server; mock chainService in unit tests
- Frontend: vitest + React Testing Library; mock WalletProvider
- IMPORTANT: Never commit without testing the full tip flow end-to-end

## Development Workflow

1. Write failing test first
2. Implement, then run all tests
3. IMPORTANT: Update CLAUDE.md if you learned something new
4. Never commit .env files or private keys

For Solidity patterns: see `docs/solidity-guide.md`
For Web3 integration: see `docs/web3-frontend.md`
For MongoDB optimization: see `docs/database-guide.md`
