import hre from "hardhat";

async function deployHello({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("justTesting", { from: deployer, args: [], log: true });
}

deployHello.tags = ["hello"];

export default deployHello;
