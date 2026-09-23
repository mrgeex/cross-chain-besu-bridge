import hre from "hardhat";
import { assert, expect } from "chai";
import bridgeA from "../../deployments/chain_a/BridgeA.json" with { type: "json" };
import bridgeB from "../../deployments/chain_b/BridgeB.json" with { type: "json" };

const { ethers } = hre;

describe("Testing Transfer from chain A to chain B", () => {
  let transferID, from, to;
  // make connection to chains and contracts
  const chainA = new ethers.JsonRpcProvider(process.env.CHAIN_A_RPC_URL);
  const chainB = new ethers.JsonRpcProvider(process.env.CHAIN_B_RPC_URL);

  const signerA = new ethers.Wallet(process.env.CHAIN_A_PRIV_KEY, chainA);
  const signerB = new ethers.Wallet(process.env.CHAIN_B_PRIV_KEY, chainB);

  const contractA = new ethers.Contract(bridgeA.address, bridgeA.abi, signerA);
  const contractB = new ethers.Contract(bridgeB.address, bridgeB.abi, signerB);

  it("", async () => {});
  describe(">> Chain_A", () => {
    it("should accept at least 1 ETH", async () => {
      await expect(
        contractA.deposit(process.env.WALLET_B, {
          value: ethers.parseEther("0.1"),
        }),
      ).to.be.reverted;
    });
    it("should emit Locked event", async () => {}); // set values of (transferID, from, to) here
    it("should create different txIDs for the same user", async () => {});
  });

  describe(">> Chain_B", () => {
    it("should set deployer as owner address", async () => {});
    it("should revert the same tx made twice", async () => {});
    it("should revert the release() made by attacker", async () => {});
    it("should revert tx if fee payments fail", () => {});
  });
});
