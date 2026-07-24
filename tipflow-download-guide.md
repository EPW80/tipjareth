# 📦 TipFlow CLAUDE.md Starter Kit - Download Guide

> Get better output from Claude Code for your Web3 project in 5 minutes

## 🚀 Quick Setup

### 1. Download Project Files (~1 min)

Create your TipFlow project and copy these files:

```bash
mkdir tipflow && cd tipflow
mkdir -p .claude docs scripts contracts backend frontend
```

### 2. Add CLAUDE.md Files (~2 min)

**Create `.claude/CLAUDE.md`** (Project instructions - commit this):
```markdown
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
```

**Create `.claude/local.md`** (Personal overrides - don't commit this):
```markdown
# TipFlow Local Development Setup

## My Environment

- Terminal: iTerm2  # Update with your terminal
- Editor: VS Code   # Update with your editor
- Node: v18.17.0 via nvm
- MongoDB: Local on port 27017

## Personal Preferences

- Always run tests before commits
- Ask before large refactors
- Keep console.log for debugging (remove before PR)
- Use npm for package management

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

- Auto-run tests on save
- Test wallet: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (hardhat account 0)
- Test with small amounts: 0.001 ETH max
- Clear localStorage between test runs

## IDE Configuration

- VS Code with Solidity + ES7 React/Redux extensions
- Auto-save enabled
- Prettier + ESLint on save
- Solidity compiler: 0.8.19

## Personal Debugging

- Browser DevTools for Web3 debugging
- MetaMask on localhost:8545 with test accounts
- MongoDB Compass for database inspection
- Hardhat console for contract testing

## Git Workflow

- Always work on feature branches
- Commit contracts and tests together
- Squash commits before merging to main
- Include "Closes #issue-number" in commits
```

### 3. Setup Git Configuration (~1 min)

```bash
# Add local.md to gitignore
echo ".claude/local.md" >> .gitignore
echo ".env*" >> .gitignore
echo "node_modules/" >> .gitignore

# Commit the project instructions
git init
git add .claude/CLAUDE.md .gitignore
git commit -m "Add CLAUDE.md project instructions"
```

### 4. Create Global CLAUDE.md (~1 min)

If you don't have a global CLAUDE.md yet:

```bash
mkdir -p ~/.claude
```

**Create `~/.claude/CLAUDE.md`** (Your personal coding preferences):
```markdown
# Global CLAUDE.md - Personal Development Preferences

## Universal Rules

- Always run tests after making changes
- Ask before committing code changes
- Keep code simple and readable
- Use meaningful variable and function names
- Add comments for complex logic

## Error Handling

- Provide user-friendly error messages
- Log errors for debugging
- Gracefully handle edge cases
- Never expose sensitive information in errors

## Testing

- Write tests before implementing features
- Test edge cases and error conditions
- Aim for high test coverage
- Use descriptive test names

IMPORTANT: Always verify functionality works end-to-end before finishing
```

## 📁 Complete File Structure

After setup, your project should look like this:

```
tipflow/
├── .claude/
│   ├── CLAUDE.md          # ✅ Committed (team instructions)
│   └── local.md           # ❌ Gitignored (personal setup)
├── .gitignore             # Contains .claude/local.md
├── contracts/             # Smart contracts
├── backend/              # Express.js API
├── frontend/             # React frontend
├── docs/                 # Documentation
└── package.json
```

## 🔄 The Self-Improvement Loop

This is the single most impactful habit:

After every correction you give Claude, end with:
> **"Update CLAUDE.md so you don't make that mistake again."**

Claude will automatically improve your project instructions over time.

## 🎯 Usage Examples

### Starting Development
```
"I want to add a new tip notification feature"
```
Claude will automatically know:
- Your MERN + Solidity stack
- To write tests first
- To use proper Web3 error handling
- To follow your security rules

### Code Review
```
"Review this smart contract function for security issues"
```
Claude will check against your specific rules:
- Reentrancy guards
- Custom errors
- Input validation
- Gas optimization

### Debugging
```
"The tip transaction is failing with a generic error"
```
Claude knows to:
- Check Web3 connection first
- Validate transaction parameters
- Provide user-friendly error messages
- Suggest checking gas limits

## 📚 Documentation Stubs

The setup also creates documentation stubs in `docs/`:

- `docs/solidity-guide.md` - Security patterns, testing, gas optimization
- `docs/web3-frontend.md` - Wallet integration, contract interaction, error handling
- `docs/database-guide.md` - MongoDB optimization, indexes, aggregations
- `docs/CLAUDE_SETUP.md` - How to use this CLAUDE.md setup

## ✅ Verification

Test your setup:

1. **Claude should know your stack**:
   ```
   "Help me add a new API endpoint"
   → Should mention Express.js, MongoDB, validation, etc.
   ```

2. **Claude should follow your conventions**:
   ```
   "Write a smart contract function"
   → Should include reentrancy guards, custom errors, events
   ```

3. **Claude should use your file structure**:
   ```
   "Create a new React component"
   → Should organize in features/ or components/shared/
   ```

## 🚀 Advanced Usage

### Module-Specific Instructions

For larger codebases, add CLAUDE.md files in subdirectories:

```
src/
├── auth/
│   └── CLAUDE.md          # Auth-specific rules
├── payments/
│   └── CLAUDE.md          # Payment-specific rules
└── dashboard/
    └── CLAUDE.md          # Dashboard-specific rules
```

### Team Collaboration

Your team gets the same Claude behavior:
1. Everyone clones the repo
2. Everyone gets `.claude/CLAUDE.md` automatically
3. Everyone creates their own `.claude/local.md`
4. Consistent coding standards across the team

## 🎉 That's It!

Your TipFlow project is now optimized for Claude Code. Every interaction will be informed by your project context, conventions, and learned improvements.

## 🔗 Learn More

- [The CLAUDE.md Starter Kit](https://github.com/claude-code-camp/claude-md-starter-kit)
- [Anthropic Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)
- [HumanLayer's CLAUDE.md Example](https://github.com/humanlayer/humanlayer/blob/main/CLAUDE.md)

---

*This setup follows The CLAUDE.md Starter Kit methodology for maximum effectiveness*