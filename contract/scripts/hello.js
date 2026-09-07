import hre from "hardhat";
const { ethers, network, getNamedAccounts, deployments } = hre;

async function main() {
  const { deployer } = await getNamedAccounts();
  const contract = await ethers.getContract("justTesting", deployer);

  console.log(`Chain ID: ${network.config.chainId}`);
  console.log(ethers.formatEther(await ethers.provider.getBalance(deployer)));
  console.log(`\n>>>>>>Contract ${contract.target} \n`);
  const helloTrx = await contract.sayHello();
  const receipt = await helloTrx.wait(1);

  for (const log of receipt.logs) {
    const parsed = contract.interface.parseLog(log);

    if (parsed?.name === "helloWorld")
      try {
        console.log(`\n>>>>>>>>Sender: ${parsed.args.sender}`);
        console.log(`\n>>>>>>>>Message: ${parsed.args.message}`);
      } catch {}
  }
}

try {
  await main();
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
