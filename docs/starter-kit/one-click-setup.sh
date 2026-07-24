#!/bin/bash
# TipFlow CLAUDE.md One-Click Setup
# Based on The CLAUDE.md Starter Kit

set -e

echo "🚀 TipFlow CLAUDE.md One-Click Setup"
echo "===================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if we're in a git repo or create one
if [ ! -d ".git" ]; then
    print_info "Initializing git repository..."
    git init
fi

# Create directory structure
print_step "Creating project structure..."
mkdir -p .claude docs contracts backend frontend scripts

# Create the main CLAUDE.md file
print_step "Creating .claude/CLAUDE.md..."
cat > .claude/CLAUDE.md << 'CLAUDEMD'
# TipFlow - Creator Tip Platform

**Stack:** MERN + Solidity + Hardhat + TypeScript + Tailwind CSS

## Commands

- `npm run dev` - Start all services (frontend + backend + hardhat node)
- `npm run test:contracts` - Run Solidity tests
- `npm run test:backend` - Run API tests
- `npm run deploy:local` - Deploy contracts locally

## Smart Contracts

**Don't:** Use `tx.origin` or ignore return values
**Do:** Use `msg.sender` and check all external calls

IMPORTANT: Always include reentrancy guards on payable functions
IMPORTANT: Test all edge cases with >95% coverage

## Backend (Express + MongoDB)

**Don't:** Trust client input or store wei as Numbers
**Do:** Sanitize everything and store wei as strings

Collections: `creators`, `tips` with ObjectId refs
Index on: `walletAddress`, `txHash`, `createdAt`

## Frontend (React + TypeScript)

**Don't:** Store private keys or trust transaction success
**Do:** Use wallet providers and verify on backend

IMPORTANT: Always handle Web3 connection errors gracefully

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

## Testing Requirements

- Smart contracts: >95% coverage including edge cases
- Backend: Unit tests for controllers/models + integration tests  
- Frontend: Component tests + tip flow E2E tests
- IMPORTANT: Never commit without testing full tip flow end-to-end

## Development Workflow

1. Write failing test first
2. Implement feature
3. Run all tests
4. IMPORTANT: Update CLAUDE.md if you learned something new

For Solidity patterns: see `docs/solidity-guide.md`
For Web3 integration: see `docs/web3-frontend.md`
CLAUDEMD

# Create local.md template
print_step "Creating .claude/local.md template..."
cat > .claude/local.md << 'LOCALMD'
# TipFlow Local Development Setup

## My Environment

- Terminal: [UPDATE: Your terminal]
- Editor: [UPDATE: Your editor]  
- Node: [UPDATE: Your Node version]
- MongoDB: [UPDATE: Local/Atlas]

## Personal Preferences

- Always run tests before commits
- Ask before large refactors
- Keep console.log for debugging (remove before PR)
- Use [UPDATE: npm/yarn/pnpm] for package management

## Local Services

```bash
npm run dev:all          # All services
npm run dev:frontend     # React (port 3000)
npm run dev:backend      # Express (port 5000)
npm run dev:contracts    # Hardhat node (port 8545)
```

## Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/tipflow-local
HARDHAT_NETWORK=localhost
ENABLE_DEBUG_LOGS=true
```

## Testing Setup

- [UPDATE: Auto-run tests preference]
- Test wallet: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
- Test with small amounts: 0.001 ETH max

## Git Workflow

- Always work on feature branches
- [UPDATE: Squash/Merge preference]
- Include "Closes #issue-number" in commits
LOCALMD

# Create documentation stubs
print_step "Creating documentation stubs..."

cat > docs/solidity-guide.md << 'SOLIDITYMD'
# Solidity Development Guide

## Security Patterns

### Reentrancy Protection
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

function withdraw() external nonReentrant {
    // Implementation
}
```

### Custom Errors (Gas Efficient)
```solidity
error InsufficientTipAmount();
error CreatorNotRegistered();

if (amount < minTip) revert InsufficientTipAmount();
```

## Testing Patterns

```javascript
await expect(tipJar.tipCreator(creator.address, "message", { value: tipAmount }))
    .to.emit(tipJar, "TipReceived")
    .withArgs(tipper.address, creator.address, tipAmount);
```
SOLIDITYMD

cat > docs/web3-frontend.md << 'WEB3MD'
# Web3 Frontend Integration Guide

## Wallet Connection

```javascript
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

const connectWallet = async () => {
    const web3Modal = new Web3Modal();
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    return provider.getSigner();
};
```

## Error Handling

```javascript
const handleContractError = (error) => {
    if (error.code === 4001) {
        return 'Transaction cancelled by user';
    } else if (error.code === -32603) {
        return 'Transaction failed - check your balance';
    }
    return 'An unexpected error occurred';
};
```
WEB3MD

# Update .gitignore
print_step "Updating .gitignore..."
cat >> .gitignore << 'GITIGNORE'

# CLAUDE.md local overrides
.claude/local.md

# Environment files
.env
.env.local
.env.development
.env.production

# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
build/
*/dist/
*/build/

# Logs
*.log
logs/

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
GITIGNORE

# Create package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    print_step "Creating package.json..."
    cat > package.json << 'PACKAGEJSON'
{
  "name": "tipflow",
  "version": "1.0.0",
  "description": "Decentralized Creator Tip Platform",
  "scripts": {
    "dev": "concurrently \"npm run dev:contracts\" \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:contracts": "cd contracts && npx hardhat node",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "test": "npm run test:contracts && npm run test:backend",
    "test:contracts": "cd contracts && npx hardhat test",
    "test:backend": "cd backend && npm test",
    "build": "npm run build:contracts && npm run build:frontend",
    "build:contracts": "cd contracts && npx hardhat compile",
    "build:frontend": "cd frontend && npm run build",
    "deploy:local": "cd contracts && npx hardhat run scripts/deploy.js --network localhost"
  },
  "keywords": ["web3", "ethereum", "solidity", "react", "nodejs", "mongodb"],
  "license": "MIT",
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
PACKAGEJSON
fi

# Create README if it doesn't exist
if [ ! -f "README.md" ]; then
    print_step "Creating README.md..."
    cat > README.md << 'README'
# TipFlow - Creator Tip Platform

A decentralized tipping platform where content creators receive ETH tips with personalized thank-you messages.

## Stack

- **Smart Contracts:** Solidity + Hardhat + OpenZeppelin
- **Backend:** Node.js + Express.js + MongoDB
- **Frontend:** React + TypeScript + Web3Modal + Tailwind CSS

## Quick Start

```bash
npm run dev          # Start all services
npm test            # Run all tests
npm run deploy:local # Deploy to local network
```

## CLAUDE.md Setup

This project uses [The CLAUDE.md Starter Kit](https://github.com/claude-code-camp/claude-md-starter-kit) for better Claude Code interactions.

- `.claude/CLAUDE.md` - Project instructions (committed)
- `.claude/local.md` - Personal setup (gitignored)

### Self-Improvement Loop

After every correction you give Claude, end with:
> "Update CLAUDE.md so you don't make that mistake again."

## Documentation

- `docs/solidity-guide.md` - Smart contract patterns
- `docs/web3-frontend.md` - Web3 integration
- `docs/database-guide.md` - MongoDB optimization

## Contributing

1. Edit `.claude/local.md` with your preferences
2. Follow the development workflow in `.claude/CLAUDE.md`
3. Always test the full tip flow end-to-end
README
fi

# Check for global CLAUDE.md
print_step "Checking global CLAUDE.md setup..."
if [ ! -f "$HOME/.claude/CLAUDE.md" ]; then
    print_warning "No global CLAUDE.md found. Creating basic one..."
    mkdir -p "$HOME/.claude"
    cat > "$HOME/.claude/CLAUDE.md" << 'GLOBALMD'
# Global CLAUDE.md - Personal Development Preferences

## Universal Rules

- Always run tests after making changes
- Ask before committing code changes  
- Keep code simple and readable
- Use meaningful variable and function names

## Error Handling

- Provide user-friendly error messages
- Log errors for debugging
- Gracefully handle edge cases

## Testing

- Write tests before implementing features
- Test edge cases and error conditions
- Use descriptive test names

IMPORTANT: Always verify functionality works end-to-end before finishing
GLOBALMD
    print_step "Created global CLAUDE.md at ~/.claude/CLAUDE.md"
else
    print_step "Global CLAUDE.md already exists at ~/.claude/CLAUDE.md"
fi

# Commit the setup
print_step "Committing CLAUDE.md setup to git..."
git add .claude/CLAUDE.md docs/ .gitignore package.json README.md
git commit -m "Add CLAUDE.md setup following starter kit methodology

- Project instructions in .claude/CLAUDE.md (60 lines)
- Documentation stubs for Solidity, Web3, MongoDB  
- Local overrides template in .claude/local.md (gitignored)
- Following Don't/Do conventions and IMPORTANT: pattern
- Ready for self-improvement loop"

echo ""
echo "🎉 TipFlow CLAUDE.md setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .claude/local.md with your personal preferences"
echo "2. Start coding with Claude using the self-improvement loop:"
echo "   \"Update CLAUDE.md so you don't make that mistake again.\""
echo ""
echo "📚 Documentation:"
echo "- docs/solidity-guide.md - Smart contract patterns"  
echo "- docs/web3-frontend.md - Web3 integration guide"
echo ""
echo "✨ Claude now knows your TipFlow project context!"
echo "Try: \"Help me add a new tip notification feature\""