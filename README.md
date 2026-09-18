# Cross Chain Besu Bridge

Local native-ETH bridge demo: two Besu QBFT chains, four validators each.
BridgeA locks funds; the demo relayer funds BridgeB's payout from its own
chain-B wallet. Blockscout is outside this setup.

## Prerequisites

- Docker Engine/Desktop running, with Docker Compose v2.20+ (`include` support).
- Node.js 24.13.0 and Corepack (`corepack --version`); the project pins Yarn 4.14.1.
- Internet for the initial Docker image, dependencies, and Solidity 0.8.7 compiler downloads.
- Free ports 18545/18546 and 28545/28546; Docker subnets 172.28.0.0/24 and 172.29.0.0/24 must not conflict with existing networks.

Besu is pinned by image digest in both Compose files; Yarn uses the checked-in
`contract/yarn.lock` and `.yarnrc.yml`. Keep the supplied genesis files, validator
keys, static peers, and permission lists together. All supplied keys are public
demo keys: use this setup locally with no real funds.

## Start and deploy

From the repository root:


```bash
docker compose up -d
```

```bash
cd contract
```

```bash
cp -n .env.example .env
```
```bash
corepack yarn install --immutable
```
```bash
corepack yarn hardhat compile
```
```bash
corepack yarn hardhat run scripts/blockNumber.js --network chain_a
corepack yarn hardhat run scripts/blockNumber.js --network chain_b
```

Allow at least one minute after starting Docker before sending blockchain
requests; slower machines may need longer.
The copy preserves an existing `.env`; use the example values for the balances
below. Wait until both block-number commands report nonzero, increasing blocks
(repeat them after a few seconds). If RPC is not ready, inspect
`docker compose logs --tail=100` from the root and retry. All four validators per
chain should be running; QBFT needs at least three to produce blocks.

| Network | Chain ID | HTTP RPC | WebSocket RPC |
| --- | --- | --- | --- |
| `chain_a` | 1337 | http://localhost:18545 | ws://localhost:18546 |
| `chain_b` | 2337 | http://localhost:28545 | ws://localhost:28546 |

From `contract/`, deploy each bridge to its matching chain:

```bash
corepack yarn hardhat deploy --network chain_a --tags chain_a
corepack yarn hardhat deploy --network chain_b --tags chain_b
```

These write addresses and ABIs to `contract/deployments/chain_a/BridgeA.json`
and `contract/deployments/chain_b/BridgeB.json`. Deploy both before the demo.
The chain-B signing key must be the BridgeB deployer (only the owner can release).

## Run the demo

From `contract/`:

```bash
corepack yarn hardhat run scripts/relayer.js 
```

One run deposits 1 ETH on chain A, observes `Locked`, and sends 1 ETH from the
chain-B owner to BridgeB, which pays the recipient and fee wallets. Wait for all
four balance lines; if the process stays open, stop it with Ctrl+C. Each rerun
moves another 1 ETH on each chain. This is a one-event demo, with no persistent
event recovery or replay protection.

Expected balances after a fresh reset, deployment, and exactly one successful
demo, using the example addresses and zero gas price (ETH units):

| Account / contract | Chain | Before demo | After demo |
| --- | --- | ---: | ---: |
| Deployer `0xfe3b557e8fb62b89f4916b721be55ceb828dbd73` | A | 1000000 | 999999 |
| Deployer `0xfe3b557e8fb62b89f4916b721be55ceb828dbd73` | B | 1000000 | 999999 |
| BridgeA | A | 0 | 1 |
| BridgeB | B | 0 | 0 |
| `WALLET_B` | B | 0 | 0.9 |
| `FEE_WALLET1` | B | 0 | 0.033333333333333333 |
| `FEE_WALLET2` | B | 0 | 0.033333333333333333 |
| `FEE_WALLET3` | B | 0 | 0.033333333333333334 |

The last fee wallet receives the rounding remainder (one wei). Fee destinations
are hardcoded in `BridgeB.sol`; `.env` fee addresses only control balance reporting.

## Stop or reset

From the repository root, stop while preserving balances and deployment records:

```bash
docker compose down
```

For a full reset, first stop any demo process. The following **deletes both
chains' history and balances**, plus local deployment records and build output:

```bash
docker compose down --volumes
rm -rf contract/deployments contract/artifacts contract/cache
```

Repeat Start and deploy, then Run the demo. Genesis restores the initial
balances; `.env` and dependencies are preserved. Do not reuse deployment records
after deleting chain volumes, or delete volumes for only one chain.
