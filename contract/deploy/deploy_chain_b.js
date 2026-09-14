import hre from "hardhat";
const { network } = hre;

async function deployChainB({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainID = network.config.chainId;

  console.log(`>>>> chain id: ${chainID}`);

  await deploy("BridgeB", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
}

deployChainB.tags = ["chain_b"];

export default deployChainB;
