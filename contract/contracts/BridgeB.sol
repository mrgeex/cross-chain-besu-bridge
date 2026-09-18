// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract BridgeB {
  address payable private immutable i_WalletOne = payable(
    0x813BF29E6a7833C5B9A8eAaf70C9151c323521bE
  );
  address payable private immutable i_WalletTwo = payable(
    0x4192b5fE1fE373Fe319CE9108Cb9fb897F8b8eff
  );
  address payable private immutable i_WalletThree = payable(
    0x29D0Bf87fd67f6D655D9e2D96124ccfA12Dac919
  );
  address private immutable i_owner;

  bytes32[] public transferIDs;

  error BridgeB_NotOwner();
  error BridgeB_releaseFailed();

  modifier onlyOwner() {
    if (msg.sender != i_owner) revert BridgeB_NotOwner();
    _;
  }

  constructor() {
    i_owner = msg.sender;
  }

  function release(
    bytes32 transferID,
    address payable _recipient
  ) external payable onlyOwner {
    uint256 _sentValue = msg.value;
    uint256 _releaseValue = (_sentValue * 90) / 100;
    uint256 _trxFeeTotal = _sentValue - _releaseValue;
    uint256 _trxFee1 = _trxFeeTotal / 3;
    uint256 _trxFee2 = _trxFeeTotal / 3;
    uint256 _trxFee3 = _trxFeeTotal - _trxFee1 - _trxFee2;

    (bool WalletOneSuccess, ) = i_WalletOne.call{value: _trxFee1}("");
    (bool WalletTwoSuccess, ) = i_WalletTwo.call{value: _trxFee2}("");
    (bool WalletThreeSuccess, ) = i_WalletThree.call{value: _trxFee3}("");
    (bool RecipientSuccess, ) = _recipient.call{value: _releaseValue}("");

    transferIDs.push(transferID);

    if (
      !RecipientSuccess ||
      !WalletOneSuccess ||
      !WalletTwoSuccess ||
      !WalletThreeSuccess
    ) revert BridgeB_releaseFailed();
  }
}
