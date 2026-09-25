import hre from "hardhat";
import { assert, expect } from "chai";
import bridgeA from "../../deployments/chain_a/BridgeA.json" with { type: "json" };
import bridgeB from "../../deployments/chain_b/BridgeB.json" with { type: "json" };

const { ethers } = hre;

describe("Testing Transfer from chain A to chain B", () => {
  let transferID, from, to, amount;
  let txA, receiptTxA;
  // make connection to chains and contracts
  const chainA = new ethers.JsonRpcProvider(process.env.CHAIN_A_RPC_URL);
  const chainB = new ethers.JsonRpcProvider(process.env.CHAIN_B_RPC_URL);

  const signerA = new ethers.Wallet(process.env.CHAIN_A_PRIV_KEY, chainA);
  const signerB = new ethers.Wallet(process.env.CHAIN_B_PRIV_KEY, chainB);

  const contractA = new ethers.Contract(bridgeA.address, bridgeA.abi, signerA);
  const contractB = new ethers.Contract(bridgeB.address, bridgeB.abi, signerB);

  before(async () => {
    txA = await contractA.deposit(process.env.WALLET_B, {
      value: ethers.parseEther("30"),
    });
    receiptTxA = await txA.wait();
  });

  describe(">> BridgeA", () => {
    it("should accept at least 1 ETH", async () => {
      await expect(
        contractA.deposit(process.env.WALLET_B, {
          value: ethers.parseEther("0.1"),
        }),
      ).to.be.reverted;
    });
    it("should emit Locked event", async () => {
      // set values of (transferID, from, to) here
      for (const log of receiptTxA.logs) {
        const parsedLog = contractA.interface.parseLog(log);

        assert.equal(parsedLog.name, "LogLocked");
        if (parsedLog.name === "LogLocked")
          [transferID, from, to, amount] = parsedLog.args;
      }
    });
    it("should create different txIDs for the same user", async () => {
      let _transferIdAgain;
      const _txAgain = await contractA.deposit(process.env.WALLET_B, {
        value: ethers.parseEther("30"),
      });
      const _receiptTxAgain = await _txAgain.wait();

      for (const log of _receiptTxAgain.logs) {
        const parsedLog = contractA.interface.parseLog(log);

        if (parsedLog.name === "LogLocked")
          _transferIdAgain = parsedLog.args[0];

        assert.notEqual(transferID, _transferIdAgain);
      }
    });
  });

  describe(">> BridgeB", async () => {
    let txB, receiptTxB;
    before(async () => {
      txB = await contractB.release(transferID, to, { value: amount });
      receiptTxB = await txB.wait();
    });

    it("should set deployer as owner address", async () => {
      const response = await contractB.getOwner();
      assert.equal(response, signerB.address);
    });
    it("should revert the same tx made twice", async () => {
      await expect(contractB.release(transferID, to, { value: amount })).to.be
        .reverted;
    });
    it("only owner can call release()", async () => {
      const attacker = new ethers.Wallet(process.env.WALLET_B_PRIV_KEY, chainB);
      const contractBAttacker = new ethers.Contract(
        bridgeB.address,
        bridgeB.abi,
        attacker,
      );

      await expect(
        contractBAttacker.release(transferID, attacker.address, {
          value: ethers.parseEther("1"),
        }),
      ).to.be.revertedWithCustomError(contractB, "BridgeB_NotOwner");
    });
    it("should revert tx if fee payments fail", () => {});
  });
});
