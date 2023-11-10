import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  // RECEIVING PARAMETERS
  // console.log(process.argv);
  const proposals = process.argv.slice(2);
  if (!proposals || proposals.length < 1)
    throw new Error("Proposals not provided");

  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });

  // CONFIGURING PROVIDER
  // const provider = ethers.getDefaultProvider("sepolia"); // Connect to sepolia, but with public RPC endpoint, so throttled
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  ); // Connect to sepolia with my RPC endpoint
  const lastBlock = await provider.getBlock("latest");
  console.log(`Last block number: ${lastBlock?.number}`);
  const lastBlockTimestamp = lastBlock?.timestamp ?? 0;
  const lastBlockDate = new Date(lastBlockTimestamp * 1000);
  console.log(
    `Last block timestamp: ${lastBlockTimestamp} (${lastBlockDate.toLocaleDateString()} ${lastBlockDate.toLocaleTimeString()})`
  );

  // CONFIGURING WALLET
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  console.log(`Using address ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance} ETH`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  // DEPLOYING CONTRACT USING TYPECHAIN
  const ballotFactory = new Ballot__factory(wallet); // real wallet, not signers like with hardhat getContractFactory
  const ballotContract = await ballotFactory.deploy(
    proposals.map(ethers.encodeBytes32String)
  ); // deploy tx sent to sepolia
  await ballotContract.waitForDeployment();
  console.log(`Contract deployed to ${ballotContract.target}`); // contract address
  for (let index = 0; index < proposals.length; index++) {
    const proposal = await ballotContract.proposals(index);
    const name = ethers.decodeBytes32String(proposal.name);
    console.log({ index, name, proposal }); // view proposals
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
