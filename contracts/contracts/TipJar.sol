// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title TipJar - creators register and receive ETH tips with messages
/// @notice Pull-payment pattern: tips accrue to a balance the creator withdraws.
///         The `isAnonymous` flag only controls off-chain display; the sender
///         address is inherently public on-chain.
contract TipJar is Ownable, ReentrancyGuard {
    struct Creator {
        string username;
        bool isActive;
        uint256 balance;
        uint256 totalReceived;
        uint256 tipCount;
    }

    uint256 public constant MAX_FEE_BPS = 1_000; // 10%
    uint256 private constant BPS_DENOMINATOR = 10_000;

    uint256 public platformFeeBps;
    uint256 public minTipWei;
    uint256 public accumulatedFees;

    mapping(address => Creator) private _creators;

    event CreatorRegistered(address indexed creator, string username);
    event TipReceived(
        address indexed from,
        address indexed creator,
        uint256 amount,
        uint256 fee,
        string message,
        bool isAnonymous
    );
    event Withdrawal(address indexed creator, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event MinTipUpdated(uint256 oldMinTipWei, uint256 newMinTipWei);
    event FeesWithdrawn(address indexed to, uint256 amount);

    error EmptyUsername();
    error AlreadyRegistered(address creator);
    error CreatorNotRegistered(address creator);
    error SelfTipNotAllowed();
    error InsufficientTipAmount(uint256 sent, uint256 minimum);
    error NothingToWithdraw();
    error FeeTooHigh(uint256 requestedBps, uint256 maxBps);
    error FeeAboveUserLimit(uint256 currentFeeBps, uint256 acceptedMaxFeeBps);
    error TransferFailed();
    error ZeroAddress();
    error DirectTransferNotAllowed();

    constructor(address initialOwner) Ownable(initialOwner) {
        platformFeeBps = 250; // 2.5%
        minTipWei = 0.0001 ether;
    }

    receive() external payable {
        revert DirectTransferNotAllowed();
    }

    function registerCreator(string calldata username) external {
        if (bytes(username).length == 0) revert EmptyUsername();
        Creator storage creator = _creators[msg.sender];
        if (creator.isActive) revert AlreadyRegistered(msg.sender);

        creator.username = username;
        creator.isActive = true;

        emit CreatorRegistered(msg.sender, username);
    }

    /// @param acceptedMaxFeeBps highest platform fee (in bps) the tipper agrees to;
    ///        protects against a fee increase landing between UI display and mining
    function tipCreator(
        address creatorAddress,
        string calldata message,
        bool isAnonymous,
        uint256 acceptedMaxFeeBps
    ) external payable nonReentrant {
        if (platformFeeBps > acceptedMaxFeeBps) {
            revert FeeAboveUserLimit(platformFeeBps, acceptedMaxFeeBps);
        }
        if (msg.value < minTipWei) revert InsufficientTipAmount(msg.value, minTipWei);
        if (creatorAddress == msg.sender) revert SelfTipNotAllowed();

        Creator storage creator = _creators[creatorAddress];
        if (!creator.isActive) revert CreatorNotRegistered(creatorAddress);

        uint256 fee = (msg.value * platformFeeBps) / BPS_DENOMINATOR;
        uint256 creatorAmount = msg.value - fee;

        accumulatedFees += fee;
        creator.balance += creatorAmount;
        creator.totalReceived += creatorAmount;
        creator.tipCount += 1;

        emit TipReceived(msg.sender, creatorAddress, msg.value, fee, message, isAnonymous);
    }

    function withdraw() external nonReentrant {
        Creator storage creator = _creators[msg.sender];
        uint256 amount = creator.balance;
        if (amount == 0) revert NothingToWithdraw();

        creator.balance = 0;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit Withdrawal(msg.sender, amount);
    }

    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert FeeTooHigh(newFeeBps, MAX_FEE_BPS);
        emit PlatformFeeUpdated(platformFeeBps, newFeeBps);
        platformFeeBps = newFeeBps;
    }

    function setMinTip(uint256 newMinTipWei) external onlyOwner {
        emit MinTipUpdated(minTipWei, newMinTipWei);
        minTipWei = newMinTipWei;
    }

    function withdrawFees(address to) external onlyOwner nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        uint256 amount = accumulatedFees;
        if (amount == 0) revert NothingToWithdraw();

        accumulatedFees = 0;

        (bool ok, ) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit FeesWithdrawn(to, amount);
    }

    function getCreator(address creatorAddress) external view returns (Creator memory) {
        return _creators[creatorAddress];
    }
}
