import hre from "hardhat";
import bridgeA from "../deployments/chain_a/BridgeA.json" with { type: "json" };
import bridgeB from "../deployments/chain_b/BridgeB.json" with { type: "json" };

const { ethers } = hre;

async function main() {
  const chainA = new ethers.JsonRpcProvider(process.env.CHAIN_A_RPC_URL);
  const chainB = new ethers.JsonRpcProvider(process.env.CHAIN_B_RPC_URL);

  const signerA = new ethers.Wallet(process.env.CHAIN_A_PRIV_KEY, chainA);
  const signerB = new ethers.Wallet(process.env.CHAIN_B_PRIV_KEY, chainB);
  const attacker = new ethers.Wallet(
    "d8527d7f9437c7d90a8271d652439d6fba9f8678da47aa02ce644680aae47e17",
    chainB,
  );

  // >>>> Listen for Locked event on chain-A and get (from, to, amount)
  // get contracts
  const contractA = new ethers.Contract(bridgeA.address, bridgeA.abi, signerA);
  const contractB = new ethers.Contract(bridgeB.address, bridgeB.abi, signerB);
  const contractBAttacker = new ethers.Contract(
    bridgeB.address,
    bridgeB.abi,
    attacker,
  );

  console.log(
    `\n >>>Total Amount Locked on Chain A: ${ethers.formatEther(await chainA.getBalance(bridgeA.address))} ETH\n`,
  );

  // listen for Locked event
  contractA.once("Locked", async (from, to, sendValue, event) => {
    try {
      const amount = sendValue;
      console.log(
        `----${event.eventName} ${ethers.formatEther(amount)} ETH----`,
      );
      console.log(`  - from ${from}`);
      console.log(`  - to ${to}`);
      console.log(`  - amount ${ethers.formatEther(sendValue)} ETH`);
      console.log("----------------");
      // >>>> Call transfer function on chain-B and set (to, 0.9 of the amount)
      // >>>> Divide 0.1 of the amount to 3 and transfer to 3 commission wallets on chain-B
      const receiveValue = (amount * 90n) / 100n;
      const trxFee = amount - receiveValue;
      const fee1 = trxFee / 3n;
      const fee2 = trxFee / 3n;
      const fee3 = trxFee - fee1 - fee2;

      const trxB = await contractB.transfer(
        receiveValue,
        to,
        fee1,
        fee2,
        fee3,
        {
          value: amount,
        },
      );
      const trxReceiptB = await trxB.wait();

      // console.log(trxReceiptB);

      const balanceB = await chainB.getBalance(to);
      const balanceFee1 = await chainB.getBalance(process.env.FEE_WALLET1);
      const balanceFee2 = await chainB.getBalance(process.env.FEE_WALLET2);
      const balanceFee3 = await chainB.getBalance(process.env.FEE_WALLET3);
      console.log(` - new balance \(${ethers.formatEther(balanceB)}\) ETH`);
      console.log(` - fee wallet 1 \(${ethers.formatEther(balanceFee1)}\) ETH`);
      console.log(` - fee wallet 2 \(${ethers.formatEther(balanceFee2)}\) ETH`);
      console.log(` - fee wallet 3 \(${ethers.formatEther(balanceFee3)}\) ETH`);
    } catch (error) {
      console.error(error);
    }
  });

  // call transfer function on contractA
  const trxA = await contractA.deposit(process.env.WALLET_B, {
    value: ethers.parseEther("1"),
  });
  const trxReceiptA = await trxA.wait();

  // console.log(trxAReceipt.logs);
}

main().catch(console.error);
