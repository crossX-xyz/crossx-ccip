#!/usr/bin/env node

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const getFiles = require("./getFiles.js");
const storeToIpfs = require("./storeToIpfs.js");

exec("npx hardhat compile", function (error, stdoutput, stderror) {
  if (error) {
    console.log("err is", error);
    return;
  }

  console.log("output", stdoutput);

  console.log("directory", process.cwd());
  //get the contract path
  const dir = path.join(process.cwd(), "/contracts");

  //get all the files/folders present in the contracts folder
  const contractPaths = getFiles(dir, []);

  //get the path where abi and bytecode is present
  const jsonPath = path.join(process.cwd(), "/artifacts", "/contracts");

  //get the files in that folder
  const getjsonContractPath = getFiles(jsonPath, []);

  //now get the files in that folder basically read the json file here
  const jsonFile = fs.readFileSync(
    getjsonContractPath[getjsonContractPath.length - 1],
    {
      encoding: "utf-8",
    },
    function (err, data) {
      console.log("data is", data);
    }
  );

  //this is the json file output
  console.log("json file is", JSON.parse(jsonFile).abi);

  //read the contract here
  const contract = fs.readFileSync(
    contractPaths[contractPaths.length - 1],
    { encoding: "utf-8" },
    function (err, data) {
      if (err) {
        console.log("error is", error);
      }

      //contract written here
      console.log("data is", data);
    }
  );

  storeToIpfs(contract, jsonFile)
    .then((result) => {
      // console.log("result is", result);
      console.info(
        "Deploy your contracts at",
        `https://crossx.vercel.app/deploy/${result}`
      );
    })
    .catch((err) => {
      console.log("err is", err);
    });

  //after doing all this publish it to ipfs and then generate a link of ipfs and show it inside
  //the vscode terminal using inquirer
});
