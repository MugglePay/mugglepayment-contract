// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";

contract MPForwarder {
  address public destination;

  constructor(address _destination) {
    destination = _destination;
  }

  function init(address _destination) public {
    require(destination == address(0x0));
    destination = _destination;
  }

  receive() external payable {
  }

  function flushETH() public {
    uint256 balance = address(this).balance;
    if (balance > 0) {
      (bool success, ) = destination.call{ value: balance }("");
      require(success, "x");      
    }
  }

  function flushERC20(address tokenContractAddress) public {
    IERC20 tokenContract = IERC20(tokenContractAddress);
    uint256 forwarderBalance = tokenContract.balanceOf(address(this));
    if (forwarderBalance > 0) {
      tokenContract.transfer(destination, forwarderBalance);
    }
  }
}
