import hre from "hardhat";
const { network } = hre;

async function deployChainA({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainID = network.config.chainId;

  console.log(`>>>> chain id: ${chainID}`);

  await deploy("BridgeA", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
}

deployChainA.tags = ["chain_a"];

export default deployChainA;
