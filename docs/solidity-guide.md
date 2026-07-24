# Solidity Development Guide

Targets Solidity ^0.8.24 with OpenZeppelin Contracts 5.x.

## Security Patterns

### Reentrancy Protection (OZ 5.x path)

```solidity
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

function withdraw() external nonReentrant {
    // checks-effects-interactions: zero the balance BEFORE transferring
}
```

Note: in OZ 5.x `ReentrancyGuard` moved from `security/` to `utils/`.

### Access Control

```solidity
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TipJar is Ownable {
    constructor(address initialOwner) Ownable(initialOwner) {}
}
```

OZ 5.x `Ownable` requires the initial owner as a constructor argument.

### Custom Errors (gas efficient, required in this repo)

```solidity
error InsufficientTipAmount(uint256 sent, uint256 minimum);
error CreatorNotRegistered(address creator);

if (msg.value < minTipWei) revert InsufficientTipAmount(msg.value, minTipWei);
```

### ETH Transfers

Use `call` with success check, never `transfer`/`send` (2300 gas stipend breaks with smart wallets):

```solidity
(bool ok, ) = payable(msg.sender).call{value: amount}("");
if (!ok) revert TransferFailed();
```

## Testing Patterns (ethers v6 + hardhat-toolbox)

```typescript
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

async function deployFixture() {
  const [owner, creator, tipper] = await ethers.getSigners();
  const tipJar = await ethers.deployContract("TipJar", [owner.address]);
  return { tipJar, owner, creator, tipper };
}

it("emits TipReceived", async () => {
  const { tipJar, creator, tipper } = await loadFixture(deployFixture);
  await tipJar.connect(creator).registerCreator("alice");
  await expect(
    tipJar.connect(tipper).tipCreator(creator.address, "gm", false, { value: ethers.parseEther("0.01") })
  ).to.emit(tipJar, "TipReceived");
});

// Custom error assertions:
await expect(tx).to.be.revertedWithCustomError(tipJar, "InsufficientTipAmount");
```

## Gas Optimization

- Custom errors over require strings
- Events for data that doesn't need on-chain reads (tip messages)
- `uint256` unless packing structs
- Cache storage reads in memory within a function
