#!/usr/bin/env node

// const { exec } = require("child_process");
// const fs = require("fs");
// const path = require("path");
// const getFiles = require("./getFiles.js");
// const storeToIpfs = require("./storeToIpfs.js");
// const { default: inquirer } = require("inquirer");
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import getFiles from "./getFiles.js";
import storeToIpfs from "./storeToIpfs.js";
import inquirer from "inquirer";
import cliSpinners from "cli-spinners";
import ora from "ora";

exec("npx hardhat compile", async function (error, stdoutput, stderror) {
  if (error) {
    console.log("err is", error);
    return;
  }

  //get the contract path
  const dir = path.join(process.cwd(), "/contracts");

  //get all the files/folders present in the contracts folder
  const contractPaths = getFiles(dir, []);

  let solidityFiles = contractPaths.filter((file) => file.includes(".sol"));

  let contractToDeployPath = "";

  if (solidityFiles.length > 1) {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "Options",
        message: "Which contract do you want to deploy?",
        choices: solidityFiles,
      },
    ]);
    contractToDeployPath = answers.Options;
  } else {
    contractToDeployPath = solidityFiles[0];
  }

  let contractToDeploy = contractToDeployPath.split("/");
  contractToDeploy = contractToDeploy[contractToDeploy.length - 1].trim();

  //get the path where abi and bytecode is present
  const jsonPath = path.join(process.cwd(), "/artifacts", "/contracts");

  //get the files in that folder
  const folders = getFiles(jsonPath, []);

  const getjsonContractPath = folders.map((folder) => {
    let fileName = folder.split("/");

    fileName = fileName[fileName.length - 1].trim();

    fileName =
      !fileName.includes(".dbg") &&
      fileName.includes(".json") &&
      fileName.split(".")[0].trim();

    if (fileName) {
      return fileName === contractToDeploy.split(".")[0].trim() && folder;
    }
  });

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
  // console.log("json file is", JSON.parse(jsonFile).abi);

  //read the contract here
  const contract = fs.readFileSync(
    contractPaths[contractPaths.length - 1],
    { encoding: "utf-8" },
    function (err, data) {
      if (err) {
        console.log("error is", error);
      }

      //contract written here
      // console.log("data is", data);
    }
  );

  let spinner = ora({
    text: "Compiling contracts & Uploading to IPFS",
    spinner: cliSpinners.dots10,
  }).start();

  storeToIpfs(contract, jsonFile)
    .then((result) => {
      spinner.stop();

      console.info(
        "Deploy your contracts at",
        `https://crossx.vercel.app/deploy/${result}`
      );
    })
    .catch((err) => {
      console.log("err is", err);
    });
});
