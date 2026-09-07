## Files
1. Bridge A contract
2. Bridge B contract
3. Relayer script


### Bridge A contract

- Accept at least 1 eth
- Generate transaction ID
- Store trx ID and value
- Count nonce per valid trx
- Lock transaction
- Emit an event "Locked" with recipient address and sendValue

### Bridge B contract

- Only the relayer can call "release"
- transfer 0.9 eth to the recipient
- divide 0.1 between 3 addresses

### Relayer script

- Reads "Locked" event from chain A
- Calls "release" function on chain B (trx ID and sendValue)
- Log transaction result


## Chain config
1. 2 Unique chain IDs
2. 8 Unique keys for each validator
3. 2 Unique docker networks
4. One validator exposing JSON-RPC
5. allocate a wallet with 1_000_000 eth (1000000000000000000000000) through genesis file
