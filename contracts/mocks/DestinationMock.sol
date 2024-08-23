// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DestinationMock {
    // Fallback function to simulate a failed ETH transfer
    fallback() external payable {
        revert();
    }

    // Receive function to simulate a failed ETH transfer
    receive() external payable {
        revert();
    }
}