#!/bin/bash

# TipFlow - CLAUDE.md Setup Script
# Based on The CLAUDE.md Starter Kit methodology

set -e

echo "🚀 Setting up TipFlow with CLAUDE.md Starter Kit..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the TipFlow project root directory"
    exit 1
fi

# Create CLAUDE.md directory structure
echo ""
echo "📁 Creating CLAUDE.md structure..."

mkdir -p .claude
mkdir -p docs

# Create the project CLAUDE.md file
print_status "Creating .claude/CLAUDE.md"
cat > .claude/CLAUDE.md << 'EOF'
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
EOF

# Create local.md template
print_status "Creating .claude/local.md template"
cat > .claude/local.md << 'EOF'
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
EOF

# Add local.md to gitignore
print_status "Adding .claude/local.md to .gitignore"
if ! grep -q ".claude/local.md" .gitignore 2>/dev/null; then
    echo ".claude/local.md" >> .gitignore
fi

# Create documentation stubs
print_status "Creating documentation stubs"

cat > docs/solidity-guide.md << 'EOF'
# Solidity Development Guide

## Security Patterns

### Reentrancy Protection
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

function withdraw() external nonReentrant {
    // Implementation
}
```

### Access Control
```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

modifier onlyRegisteredCreator() {
    require(creators[msg.sender].isActive, "Not registered");
    _;
}
```

### Custom Errors (Gas Efficient)
```solidity
error InsufficientTipAmount();
error CreatorNotRegistered();

// Instead of:
// require(amount >= minTip, "Insufficient tip amount");
if (amount < minTip) revert InsufficientTipAmount();
```

## Testing Patterns

### Setup
```javascript
beforeEach(async function () {
    [owner, creator, tipper] = await ethers.getSigners();
    tipJar = await TipJar.deploy(feeRecipient.address);
});
```

### Event Testing
```javascript
await expect(tipJar.tipCreator(creator.address, "message", { value: tipAmount }))
    .to.emit(tipJar, "TipReceived")
    .withArgs(tipper.address, creator.address, tipAmount);
```

## Gas Optimization

- Use `uint256` instead of smaller uints (unless packing)
- Pack structs efficiently
- Use events for data that doesn't need on-chain queries
- Batch operations when possible
EOF

cat > docs/web3-frontend.md << 'EOF'
# Web3 Frontend Integration Guide

## Wallet Connection

```javascript
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

const connectWallet = async () => {
    const web3Modal = new Web3Modal();
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    return { provider, signer };
};
```

## Contract Interaction

```javascript
const tipCreator = async (creatorAddress, amount, message) => {
    try {
        const tx = await contract.tipCreatorETH(
            creatorAddress,
            message,
            false, // isAnonymous
            { value: ethers.utils.parseEther(amount) }
        );
        
        // Store pending transaction
        await apiService.post('/tips', {
            txHash: tx.hash,
            status: 'pending'
        });
        
        return tx;
    } catch (error) {
        console.error('Tip failed:', error);
        throw new Error('Transaction failed');
    }
};
```

## Error Handling

```javascript
const handleContractError = (error) => {
    if (error.code === 4001) {
        return 'Transaction cancelled by user';
    } else if (error.code === -32603) {
        return 'Transaction failed - check your balance';
    } else {
        return 'An unexpected error occurred';
    }
};
```

## State Management

```javascript
// Use React Query for server state
const { data: tips, isLoading } = useQuery(
    ['tips', creatorId],
    () => apiService.getTips(creatorId)
);

// Use React Context for Web3 state
const Web3Context = createContext();
```
EOF

cat > docs/database-guide.md << 'EOF'
# MongoDB Optimization Guide

## Index Strategy

```javascript
// Creator model indexes
creatorSchema.index({ walletAddress: 1 }, { unique: true });
creatorSchema.index({ username: 1 }, { unique: true });
creatorSchema.index({ 'stats.totalReceived': -1 });

// Tip model indexes  
tipSchema.index({ txHash: 1 }, { unique: true });
tipSchema.index({ creatorAddress: 1, timestamp: -1 });
tipSchema.index({ fromAddress: 1, timestamp: -1 });
```

## Aggregation Pipelines

```javascript
// Creator analytics
const getCreatorStats = (creatorId, period = '30d') => {
    return Tip.aggregate([
        {
            $match: {
                toCreator: ObjectId(creatorId),
                status: 'confirmed',
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: { $toDouble: '$amount' } },
                tipCount: { $sum: 1 },
                uniqueTippers: { $addToSet: '$fromAddress' }
            }
        }
    ]);
};
```

## Performance Tips

- Use lean() for read-only queries
- Implement pagination with cursor-based approach
- Cache frequently accessed creator profiles
- Use MongoDB Atlas for production with proper connection pooling
EOF

# Create a basic README for the CLAUDE.md setup
print_status "Creating CLAUDE.md setup documentation"
cat > docs/CLAUDE_SETUP.md << 'EOF'
# CLAUDE.md Setup for TipFlow

This project uses The CLAUDE.md Starter Kit methodology for better Claude Code interactions.

## File Structure

```
.claude/
├── CLAUDE.md          # Project instructions (committed to git)
└── local.md           # Personal overrides (gitignored)
```

## What Each File Does

**CLAUDE.md**: Project-level instructions that your whole team benefits from
- Stack information and project structure
- Key commands and conventions
- Security rules and testing requirements
- Development workflow

**local.md**: Personal development setup (never committed)
- Your terminal, editor, and tool preferences  
- Local environment variables
- Personal debugging setup
- Git workflow preferences

## Usage

Claude Code automatically reads these files at the start of every session. The more specific file wins — local overrides project.

## Self-Improvement Loop

After every correction you give Claude, end with:
> "Update CLAUDE.md so you don't make that mistake again."

This makes your CLAUDE.md smarter over time.

## Best Practices

- Keep CLAUDE.md under 80 lines
- Use "Don't/Do" patterns
- Mark critical rules with IMPORTANT:
- Avoid personality instructions
- Focus on actionable project context

## Learn More

- [The CLAUDE.md Starter Kit](https://github.com/claude-code-camp/claude-md-starter-kit)
- [HumanLayer's CLAUDE.md](https://github.com/humanlayer/humanlayer/blob/main/CLAUDE.md)
- [Anthropic's Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)
EOF

# Check if global CLAUDE.md exists
echo ""
print_info "Checking for global CLAUDE.md..."

if [ ! -f "$HOME/.claude/CLAUDE.md" ]; then
    print_warning "Global CLAUDE.md not found at ~/.claude/CLAUDE.md"
    print_info "Would you like to create a basic global CLAUDE.md? (y/n)"
    read -r create_global
    
    if [ "$create_global" = "y" ] || [ "$create_global" = "Y" ]; then
        mkdir -p "$HOME/.claude"
        cat > "$HOME/.claude/CLAUDE.md" << 'EOF'
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
EOF
        print_status "Created global CLAUDE.md at ~/.claude/CLAUDE.md"
    fi
else
    print_status "Global CLAUDE.md already exists at ~/.claude/CLAUDE.md"
fi

# Add CLAUDE.md to git (but not local.md)
echo ""
print_status "Adding CLAUDE.md to git (excluding local.md)"
git add .claude/CLAUDE.md
git add docs/
git add .gitignore

echo ""
echo "🎉 CLAUDE.md setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .claude/local.md with your personal preferences"
echo "2. Commit the project CLAUDE.md: git commit -m 'Add CLAUDE.md project instructions'"
echo "3. Start using the self-improvement loop: 'Update CLAUDE.md so you don't make that mistake again'"
echo ""
echo "📚 Documentation created in docs/ directory"
echo "📖 Read docs/CLAUDE_SETUP.md for usage instructions"
echo ""
echo "✨ Your project is now optimized for Claude Code!"
EOF

chmod +x setup-claude.sh