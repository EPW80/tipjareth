# TipFlow — Creator Tip Platform

A decentralized tipping platform where content creators receive ETH tips with personalized messages.

## Stack

- **Smart contracts:** Solidity ^0.8.24 + Hardhat + OpenZeppelin 5
- **Backend:** Express + TypeScript + MongoDB (Mongoose), verifies every tip on-chain
- **Frontend:** React 18 + TypeScript + Vite + Tailwind, ethers v6 (no wagmi/@tanstack — see dependency policy in `.claude/CLAUDE.md`)

## Quick Start

```bash
npm install
npm run dev            # hardhat node :8545 + API :5000 + web :5173
npm run deploy:local   # deploy TipJar, writes config/addresses.json
npm run db:seed        # seed demo creators (needs local MongoDB on :27017)
npm test               # contracts + backend + frontend tests
```

Requires Node 22+, a local MongoDB (`mongodb://localhost:27017/tipflow-local`), and MetaMask pointed at `localhost:8545` (chainId 31337) for the browser flow.

## Layout

```
contracts/   TipJar.sol, tests, deploy script
backend/     Express API + on-chain tip verification
frontend/    React app (features/tipping, creators, dashboard)
config/      addresses.json — single source of truth for contract addresses
docs/        solidity-guide, web3-frontend, database-guide + starter-kit reference
```

## Documentation

- `docs/solidity-guide.md` — contract patterns (OZ 5, custom errors, testing)
- `docs/web3-frontend.md` — wallet connection, contract calls, error mapping
- `docs/database-guide.md` — indexes, aggregations, wei-as-strings
- `.claude/CLAUDE.md` — project conventions for Claude Code
