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
