// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract BridgeA {
  uint256 public constant MIN_VALUE = 1 * 1e18;
  mapping(address => uint256) private s_addressToValue;
  string[] public transactions;
  uint256 public nonce;

  event Locked(bytes32 transferID, address indexed from, address indexed to, uint256 sendValue);

  function deposit(address _recipient) external payable {
    require(msg.value >= MIN_VALUE);

    nonce++;
    bytes32 _transferID = keccak256(abi.encode(block.chainid, address(this), nonce));

    emit Locked(_transferID, msg.sender, _recipient, msg.value);
  }
}
