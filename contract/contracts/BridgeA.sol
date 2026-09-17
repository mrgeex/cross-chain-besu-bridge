// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract BridgeA {
  uint256 public constant MIN_VALUE = 1 * 1e18;
  mapping(address => uint256) private s_addressToValue;
  string[] public transactions;

  event Locked(address indexed from, address indexed to, uint256 sendValue);

  function deposit(address _recipient) external payable {
    require(msg.value >= MIN_VALUE);

    address _from = msg.sender;
    address _to = _recipient;

    emit Locked(_from, _to, msg.value);
  }
}
