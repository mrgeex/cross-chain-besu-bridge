// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

error BridgeB_transferFailed();

contract BridgeB {
  address payable private immutable i_WalletOne;
  address payable private immutable i_WalletTwo;
  address payable private immutable i_WalletThree;

  function transfer(
    uint256 _sendValue,
    address payable _recipient,
    uint256 _feeOne,
    uint256 _feeTwo,
    uint256 _feeThree
  ) external payable {
    (bool WalletOneSuccess, ) = i_WalletOne.call{value: _feeOne}("");
    (bool WalletTwoSuccess, ) = i_WalletTwo.call{value: _feeTwo}("");
    (bool WalletThreeSuccess, ) = i_WalletThree.call{value: _feeThree}("");
    (bool RecipientSuccess, ) = _recipient.call{value: _sendValue}("");

    if (
      !RecipientSuccess &&
      !WalletOneSuccess &&
      !WalletTwoSuccess &&
      !WalletThreeSuccess
    ) revert BridgeB_transferFailed();
  }
}
