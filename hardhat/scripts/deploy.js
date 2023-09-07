// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const Create2Deployer = await hre.ethers.getContractFactory(
    "Create2Deployer"
  );
  const create2Deployer = Create2Deployer.attach(
    "0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2"
  );

  const CrossX = await hre.ethers.getContractFactory("CrossX");
  const salt =
    "0x1001000000001000000001000001110100000110000000000001110001011010";
  console.log("salt", salt);

  const tx = await create2Deployer.deploy(0, salt, CrossX.bytecode);
  await tx.wait();
  const bytecodehash = hre.ethers.utils.keccak256(CrossX.bytecode);
  const address = await create2Deployer.computeAddress(salt, bytecodehash);
  console.log("address", address);

  const crossX = CrossX.attach(address);
  await crossX.initialize("0xD0daae2231E9CB96b94C8512223533293C3693Bf");
  console.log("CrossX", crossX.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
