// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DestinationMock {
    // Receive function to simulate a failed ETH transfer
    receive() external payable {
        revert();
    }
}