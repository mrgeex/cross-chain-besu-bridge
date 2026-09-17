// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

error BridgeB_releaseFailed();
error BridgeB_NotOwner();

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

  modifier onlyOwner() {
    if (msg.sender != i_owner) revert BridgeB_NotOwner();
    _;
  }

  function transfer(
    uint256 _sendValue,
    address payable _recipient,
    uint256 _feeOne,
    uint256 _feeTwo,
    uint256 _feeThree
  ) external payable onlyOwner {
    (bool WalletOneSuccess, ) = i_WalletOne.call{value: _feeOne}("");
    (bool WalletTwoSuccess, ) = i_WalletTwo.call{value: _feeTwo}("");
    (bool WalletThreeSuccess, ) = i_WalletThree.call{value: _feeThree}("");
    (bool RecipientSuccess, ) = _recipient.call{value: _sendValue}("");

    if (
      !RecipientSuccess ||
      !WalletOneSuccess ||
      !WalletTwoSuccess ||
      !WalletThreeSuccess
    ) revert BridgeB_releaseFailed();
  }
}
