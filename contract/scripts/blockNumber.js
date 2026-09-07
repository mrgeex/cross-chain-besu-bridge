import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log(
    ">>>> CurrentBlock Number",
    await ethers.provider.getBlockNumber(),
  );
}

main();
