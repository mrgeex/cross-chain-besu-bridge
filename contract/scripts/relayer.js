import hre from "hardhat";
import bridgeA from "../deployments/chain_a/BridgeA.json" with { type: "json" };
import bridgeB from "../deployments/chain_b/BridgeB.json" with { type: "json" };

const { ethers } = hre;

async function main() {
  const chainA = new ethers.JsonRpcProvider(process.env.CHAIN_A_RPC_URL);
  const chainB = new ethers.JsonRpcProvider(process.env.CHAIN_B_RPC_URL);

  const signerA = new ethers.Wallet(process.env.CHAIN_A_PRIV_KEY, chainA);
  const signerB = new ethers.Wallet(process.env.CHAIN_B_PRIV_KEY, chainB);

  // >>>> Listen for Locked event on chain-A and get (from, to, amount)
  // get contracts
  const contractA = new ethers.Contract(bridgeA.address, bridgeA.abi, signerA);
  const contractB = new ethers.Contract(bridgeB.address, bridgeB.abi, signerB);

  console.log(
    `\n >>>Total Amount Locked on Chain A: ${ethers.formatEther(await chainA.getBalance(bridgeA.address))} ETH\n`,
  );

  // call transfer function on contractA
  const trxA = await contractA.transfer(
    signerB.address,
    ethers.parseEther("30"),
    { value: ethers.parseEther("30") },
  );
  const trxAReceipt = await trxA.wait();

  // listen for Locked event
  contractA.on("Locked", async (sender, message, timestamp, event) => {
    const amount = event.args.sendValue;
    console.log(`----${event.eventName} ${ethers.formatEther(amount)} ETH----`);
    console.log(`  - from ${sender}`);
    console.log(`  - to ${event.args.to}`);
    console.log(`  - amount ${event.args.sendValue}`);
    console.log("----------------");
    // >>>> Call transfer function on chain-B and set (to, 0.9 of the amount)
    // >>>> Divide 0.1 of the amount to 3 and transfer to 3 commission wallets on chain-B
    const sendValue = (amount * 90n) / 100n;
    const trxFee = amount - sendValue;
    const fee1 = trxFee / 3n;
    const fee2 = trxFee / 3n;
    const fee3 = trxFee - fee1 - fee2;
    const trxB = await contractB.transfer(
      sendValue,
      event.args.to,
      fee1,
      fee2,
      fee3,
      { value: amount },
    );
    const trxBReceipt = await trxB.wait();

    const balanceB = await chainB.getBalance(event.args.to);
    const balanceFee1 = await chainB.getBalance(
      "0x813BF29E6a7833C5B9A8eAaf70C9151c323521bE",
    );
    const balanceFee2 = await chainB.getBalance(
      "0x4192b5fE1fE373Fe319CE9108Cb9fb897F8b8eff",
    );
    const balanceFee3 = await chainB.getBalance(
      "0x29D0Bf87fd67f6D655D9e2D96124ccfA12Dac919",
    );
    console.log(` - new balance \(${ethers.formatEther(balanceB)}\) ETH`);
    console.log(` - fee wallet 1 \(${ethers.formatEther(balanceFee1)}\) ETH`);
    console.log(` - fee wallet 2 \(${ethers.formatEther(balanceFee2)}\) ETH`);
    console.log(` - fee wallet 3 \(${ethers.formatEther(balanceFee3)}\) ETH`);
  });
}

main().catch(console.error);
