import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log(`>>>> Accounts \n ${await ethers.getSigners()}\n`);
}

try {
  await main();
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
