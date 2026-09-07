// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract justTesting {
  event helloWorld(address indexed sender, string message);

  function sayHello() external {
    emit helloWorld(msg.sender, "hello world!");
  }
}
