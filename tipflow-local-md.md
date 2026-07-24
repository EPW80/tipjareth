# TipFlow Local Development Setup

## My Environment

- Terminal: [Your terminal - e.g., iTerm2, Warp, Ghostty]
- Editor: [Your editor - e.g., VS Code, Cursor, Vim]
- Node: [Your Node version - e.g., v18.17.0 via nvm]
- MongoDB: [Local/Atlas - e.g., Local on port 27017]

## Personal Preferences

- Always run tests before commits
- Ask before large refactors
- Keep console.log for debugging (remove before PR)
- Use [npm/yarn/pnpm] for package management

## Local Services

```bash
# My development stack
npm run dev:all          # All services
npm run dev:frontend     # React (port 3000)
npm run dev:backend      # Express (port 5000)
npm run dev:contracts    # Hardhat node (port 8545)
npm run db:seed          # Seed with test data
```

## Environment Variables (.env.local)

```
MONGODB_URI=mongodb://localhost:27017/tipflow-local
HARDHAT_NETWORK=localhost
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
ENABLE_DEBUG_LOGS=true
```

## Testing Setup

- [Auto-run tests on save/Manual testing preference]
- Test wallet: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (hardhat account 0)
- Test with small amounts: 0.001 ETH max
- Clear localStorage between test runs

## IDE Configuration

- [Your specific VS Code extensions/settings]
- [Auto-save preferences]
- [Formatter settings - Prettier, ESLint]
- [Solidity compiler version]

## Personal Debugging

- Browser DevTools for Web3 debugging
- MetaMask on localhost:8545 with test accounts
- [MongoDB Compass/Studio 3T] for database inspection
- Hardhat console for contract testing

## Git Workflow

- Always work on feature branches
- Commit contracts and tests together
- [Squash/Merge preference]
- Include "Closes #issue-number" in commits