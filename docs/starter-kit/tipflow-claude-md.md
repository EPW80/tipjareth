# TipFlow - Creator Tip Platform

**Stack:** MERN + Solidity + Hardhat + TypeScript + Tailwind CSS

## Project Structure

```
tipflow/
├── contracts/          # Solidity contracts + tests
├── backend/           # Express.js API + MongoDB  
├── frontend/          # React + TypeScript + Vite
└── scripts/           # Deployment + utilities
```

## Commands

- `npm run dev` - Start all services (frontend + backend + hardhat node)
- `npm run test:contracts` - Run Solidity tests
- `npm run test:backend` - Run API tests
- `npm run deploy:local` - Deploy contracts locally
- `npm run build` - Build for production

## Smart Contracts

**Don't:** Use `tx.origin` or ignore return values
**Do:** Use `msg.sender` and check all external calls

**Don't:** Trust external contract data
**Do:** Validate all inputs with custom errors

IMPORTANT: Always include reentrancy guards on payable functions
IMPORTANT: Test all edge cases with >95% coverage

## Backend (Express + MongoDB)

**Don't:** Trust client input or log sensitive data
**Do:** Sanitize everything and use Winston with levels

**Don't:** Store wei amounts as Numbers
**Do:** Store as strings to avoid precision loss

Collections: `creators`, `tips` with ObjectId refs
Index on: `walletAddress`, `txHash`, `createdAt`
Rate limit: 100 requests/minute per IP

## Frontend (React + TypeScript)

**Don't:** Store private keys or trust transaction success
**Do:** Use wallet providers and verify on backend

**Don't:** Show raw blockchain errors to users
**Do:** Display user-friendly messages

IMPORTANT: Always handle Web3 connection errors gracefully
IMPORTANT: Validate all blockchain data on backend

## Code Organization

```
src/
├── features/
│   ├── tipping/
│   ├── creators/
│   └── dashboard/
├── components/shared/
└── hooks/web3/
```

**Don't:** Mix Web3 logic with UI components
**Do:** Use custom hooks for Web3 operations

**Don't:** Duplicate contract addresses across files  
**Do:** Use single config file for all addresses

## Security Rules

Smart Contracts:
- No `any` types in interfaces
- Events for all state changes
- Gas optimization for user-facing functions
- Custom errors over require strings

Backend:
- JWT for auth, bcrypt for passwords
- Environment variables for all config
- Request validation with express-validator

Frontend:
- Web3Modal for wallet connections
- React Query for server state
- Error boundaries for Web3 failures

## Testing Requirements

- Smart contracts: >95% coverage including edge cases
- Backend: Unit tests for controllers/models + integration tests
- Frontend: Component tests + tip flow E2E tests
- IMPORTANT: Never commit without testing full tip flow end-to-end

## Performance Rules

- Backend: Paginate all lists (limit: 50), cache creator profiles (5min)
- Frontend: Lazy load components, batch contract calls
- Database: Use aggregation for analytics
- Blockchain: Confirm transactions before UI updates

## Development Workflow

1. Write failing test first
2. Implement feature
3. Run all tests
4. IMPORTANT: Update CLAUDE.md if you learned something new
5. Never commit .env files or private keys

## Deployment

Contracts: Deploy to Sepolia → verify on Etherscan
Backend: Railway/Heroku with environment variables
Frontend: Vercel with production contract addresses
Database: MongoDB Atlas with IP whitelist

For Solidity patterns: see `docs/solidity-guide.md`
For Web3 integration: see `docs/web3-frontend.md`
For MongoDB optimization: see `docs/database-guide.md`