import hre from "hardhat";
const { ethers, network } = hre;

async function deployHello({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("justTesting", { from: deployer, args: [], log: true });
}

export default deployHello;
