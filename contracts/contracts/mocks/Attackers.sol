// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TipJar} from "../TipJar.sol";

/// @dev Test helper: registers as a creator but rejects all ETH transfers,
///      forcing TipJar's withdrawal `call` to fail.
contract RejectingReceiver {
    TipJar private immutable tipJar;

    constructor(TipJar _tipJar) {
        tipJar = _tipJar;
    }

    function register(string calldata username) external {
        tipJar.registerCreator(username);
    }

    function withdraw() external {
        tipJar.withdraw();
    }
    // no receive/fallback: any ETH transfer to this contract reverts
}

/// @dev Test helper: attempts to re-enter withdraw() from its receive hook.
contract ReentrantAttacker {
    TipJar private immutable tipJar;

    constructor(TipJar _tipJar) {
        tipJar = _tipJar;
    }

    function register(string calldata username) external {
        tipJar.registerCreator(username);
    }

    function attack() external {
        tipJar.withdraw();
    }

    receive() external payable {
        tipJar.withdraw();
    }
}

/// @dev Test helper: attempts to re-enter tipCreator() from its receive hook
///      while its own withdraw() payout is in flight.
contract TipReentrantAttacker {
    TipJar private immutable tipJar;
    address private target;

    constructor(TipJar _tipJar) {
        tipJar = _tipJar;
    }

    function register(string calldata username) external {
        tipJar.registerCreator(username);
    }

    function setTarget(address _target) external {
        target = _target;
    }

    function attack() external {
        tipJar.withdraw();
    }

    receive() external payable {
        tipJar.tipCreator{value: msg.value}(target, "re-enter", false, 10_000);
    }
}

/// @dev Test helper: deployed as the TipJar owner; attempts to re-enter
///      withdrawFees() from its receive hook during the fee payout.
///      (withdrawFees checks onlyOwner before nonReentrant, so only the
///      owner itself can reach the reentrancy guard.)
contract FeeReentrantAttacker {
    TipJar public tipJar;

    function setTipJar(TipJar _tipJar) external {
        tipJar = _tipJar;
    }

    function attack() external {
        tipJar.withdrawFees(address(this));
    }

    receive() external payable {
        tipJar.withdrawFees(address(this));
    }
}
