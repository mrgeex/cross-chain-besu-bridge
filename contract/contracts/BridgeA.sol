// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract BridgeA {
  uint256 public constant MIN_VALUE = 1 ether;

  uint256 public nonce;
  string[] public transactions;
  mapping(address => uint256) private s_addressToValue;

  event Locked(
    bytes32 indexed transferID,
    address indexed from,
    address indexed to,
    uint256 sendValue
  );

  function deposit(address _recipient) public payable {
    require(msg.value >= MIN_VALUE);

    nonce++;
    bytes32 _transferID = keccak256(
      abi.encode(block.chainid, address(this), msg.sender, _recipient, nonce)
    );

    emit Locked(_transferID, msg.sender, _recipient, msg.value);
  }

  receive() external payable {
    deposit(msg.sender);
  }
}
