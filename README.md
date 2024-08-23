# MPForwarder Smart Contract

This project contains the `MPForwarder` smart contract, which is designed to forward ETH and ERC20 tokens to a specified destination address. The contract is built using Solidity and the Hardhat development environment.

## Usage

### Install Dependencies

To install the dependencies for the project, run:

```shell
npm install
```

### Compile the Contracts

To compile the smart contracts, run:

```shell
npx hardhat compile
```

### Run the Tests

To run the tests for the smart contracts, run:

```shell
npx hardhat test
```

With the `REPORT_GAS` environment variable set to `true`, the tests will also report the gas usage for each test:

```shell
REPORT_GAS=true npx hardhat test
```

### Deploy the Contracts

Setup the required environment variables:

```shell
npx hardhat vars set INFURA_API_KEY <infura-api-key>
npx hardhat vars set PRIVATE_KEY <private-key>
```

Modify the parameters in the `ignition/parameters.json` file as needed. E.g.

```json
{
  "MPForwarder": {
    "destination": "0xYOUR_ADDRESS"
  }
}
```

To deploy the `MPForwarder` smart contract, run:

```shell
npx hardhat ignition deploy ./ignition/modules/MPForwarder.ts --network <network> --parameters ignition/parameters.json
```

Replace `<network>` with the desired network:

- `localhost` (default)
- `arbitrum`
- `bsc`

Or specify a custom network in the `hardhat.config.ts` file.

### Mainnet deployed contract

- Arbitrum: `0x59e56bB2aB29C40B340AfbE7f8D8061FE09a5841`
- BSC: `0x4fA49144bb120f5665Bc5210C28013bf3421c04D`
