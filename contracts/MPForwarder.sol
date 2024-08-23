// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MPForwarder {
  using SafeERC20 for IERC20;

  address public destination;

  event ETHFlushed(address indexed to, uint256 amount);
  event ERC20Flushed(address indexed token, address indexed to, uint256 amount);

  constructor(address _destination) {
    destination = _destination;
  }

  receive() external payable {
    // Accept ETH deposits
  }

  fallback() external {
    // Fallback function to handle unexpected calls
  }

  function flushETH() external {
    require(destination != address(0), "Destination address not set");
    uint256 balance = address(this).balance;
    require(balance > 0, "No ETH to flush");
    (bool success, ) = destination.call{ value: balance }("");
    require(success, "ETH transfer failed");
    emit ETHFlushed(destination, balance);
  }

  function flushERC20(address tokenContractAddress) external {
    require(destination != address(0), "Destination address not set");
    require(tokenContractAddress != address(0), "Invalid token address");
    IERC20 tokenContract = IERC20(tokenContractAddress);
    uint256 forwarderBalance = tokenContract.balanceOf(address(this));
    require(forwarderBalance > 0, "No ERC20 tokens to flush");
    tokenContract.safeTransfer(destination, forwarderBalance);
    emit ERC20Flushed(tokenContractAddress, destination, forwarderBalance);
  }
}
