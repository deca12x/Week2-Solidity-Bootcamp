import { ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  // RECEIVING PARAMETERS
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 1)
    throw new Error("Parameters not provided");
  const contractAddress = parameters[0];

  // CONFIGURING PROVIDER, WALLET AND CONTRACT
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  const ballotFactory = new Ballot__factory(wallet);
  const ballotContract = ballotFactory.attach(contractAddress) as Ballot;

  // QUERY RESULTS
  console.log(`Querying results`);
  const proposal1 = await ballotContract.proposals(0);
  const proposal2 = await ballotContract.proposals(1);
  const proposal3 = await ballotContract.proposals(2);
  const proposals = [proposal1, proposal2, proposal3];
  for (const proposal of proposals) {
    console.log(
      `${ethers.decodeBytes32String(proposal.name)} - ${
        proposal.voteCount
      } votes`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
