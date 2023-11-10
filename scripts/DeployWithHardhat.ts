// Run this with npx ts-node ./scripts/DeployWithHardhat.ts "arg1" "arg2" "arg3"
// If we run with npx hardhat run scripts/DeployWithHardhat.ts "arg1" "arg2" "arg3"
// ...we will get an error, because hardhat does not support passing arguments to scripts

import { ethers } from "hardhat";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function main() {
  // console.log(process.argv);
  const proposals = process.argv.slice(2);
  if (!proposals || proposals.length < 1)
    throw new Error("Proposals not provided");

  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });

  const signers = await ethers.getSigners();
  const provider = signers[0].provider;
  // Deploy ballot contract (will create a tx in a first block)
  const ballotFactory = await ethers.getContractFactory("Ballot"); // hardhat method (supercharged ethers)
  const proposalsBytes32 = PROPOSALS.map(ethers.encodeBytes32String);
  const ballotContract = await ballotFactory.deploy(proposalsBytes32); // tx sent
  // Check last block number, should be 1
  const lastBlock = await provider.getBlock("latest");
  const lastBlockNumber = lastBlock?.number;
  console.log(`Last block number: ${lastBlockNumber}`);
  // View proposals: index is 1, 2, 3; name is decoded string; proposal contains encoded name & voteCount
  await ballotContract.waitForDeployment();
  for (let index = 0; index < proposals.length; index++) {
    const proposal = await ballotContract.proposals(index);
    const name = ethers.decodeBytes32String(proposal.name);
    console.log({ index, name, proposal });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
