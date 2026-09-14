// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

error BridgeB_transferFailed();

contract BridgeB {
  address payable private i_WalletOne =
    payable(0x813BF29E6a7833C5B9A8eAaf70C9151c323521bE);
  address payable private i_WalletTwo =
    payable(0x4192b5fE1fE373Fe319CE9108Cb9fb897F8b8eff);
  address payable private i_WalletThree =
    payable(0x29D0Bf87fd67f6D655D9e2D96124ccfA12Dac919);

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
      !RecipientSuccess ||
      !WalletOneSuccess ||
      !WalletTwoSuccess ||
      !WalletThreeSuccess
    ) revert BridgeB_transferFailed();
  }
}
