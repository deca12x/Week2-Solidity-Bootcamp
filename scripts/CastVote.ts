import { ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  // RECEIVING PARAMETERS
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 2)
    throw new Error("Parameters not provided");
  const contractAddress = parameters[0];
  const proposalNumber = parameters[1];

  // CONFIGURING PROVIDER, WALLET AND CONTRACT
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  const ballotFactory = new Ballot__factory(wallet);
  const ballotContract = ballotFactory.attach(contractAddress) as Ballot;

  // CAST A VOTE
  console.log(`Casting a vote`);
  const voter = await ballotContract.voters(wallet.address);
  if (!voter.weight) {
    throw new Error("No voting rights");
  } else if (voter.voted) {
    throw new Error("No voting rights");
  } else {
    const tx = await ballotContract.vote(proposalNumber);
    const receipt = await tx.wait();
    console.log(`Transaction completed ${receipt?.hash}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
