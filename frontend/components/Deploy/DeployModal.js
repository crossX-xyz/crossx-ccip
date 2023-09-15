import Image from "next/image";
import React, { useState, useEffect } from "react";
import { AiFillCopy, AiOutlineDeploymentUnit } from "react-icons/ai";
import Loader from "../Loader/Loader";
import { useContract, useContractWrite } from "wagmi";
import { readContract, writeContract } from "@wagmi/core";

import { ethers } from "ethers";
import Confetti from "react-confetti";
import { useWindowDimensions } from "@/constants/windowSize.js";
import { waitForTransaction } from "@wagmi/core";

import {
  deployerAbi,
  contractAddress,
  axelarDomains,
  rpcUrls,
} from "@/constants";
import { useRouter } from "next/router";
import { data } from "autoprefixer";
const Backdrop = ({ onClose }) => {
  return (
    <div
      onClick={onClose}
      className="top-0 left-0 fixed bg-black/20 backdrop-blur-md h-screen w-screen"
    ></div>
  );
};

const DeployModal = ({
  onClose,
  bytecode,
  formData,
  setFormData,
  initializable,
  initializableData,
  abi,
}) => {
  const [generatingAddress, setGeneratingAddress] = useState(false);
  const [startDeploying, setStartDeploying] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [salt, setSalt] = useState("");
  const [computedAddress, setComputedAddress] = useState("");
  const [txhash, setTxhash] = useState("");
  const { data, writeAsync: deploy } = useContractWrite({
    address: contractAddress,
    abi: deployerAbi,
    functionName: "xDeployer",
  });

  const { height, width } = useWindowDimensions();
  const router = useRouter();
  const computeAddress = async () => {
    try {
      if (salt === "") {
        alert("Please enter salt");
        return;
      }
      const abiCoder = new ethers.utils.AbiCoder();
      const saltbytes = abiCoder.encode(["uint256"], [salt]);
      const address = await readContract({
        address: contractAddress,
        abi: deployerAbi,
        functionName: "computeAddress",
        args: [saltbytes, bytecode],
      });

      setComputedAddress(address);
    } catch (err) {
      console.log(err, "compute address");
    }
  };

  const generateAddressHandler = async () => {
    if (salt === "") {
      alert("Please enter salt");
      return;
    }
    setGeneratingAddress(true);
    await computeAddress();
  };
  console.log(formData, "multichains");

  const deployContractHandler = async () => {
    try {
      if (salt === "") {
        alert("Please enter salt");
        return;
      }
      console.log(salt, "salt");
      setStartDeploying(true);
      //this function will add all the formdata to polybase
      const abiCoder = new ethers.utils.AbiCoder();
      const saltbytes = abiCoder.encode(["uint256"], [salt]);
      let domains = [];
      let fees = [];

      let tx;
      console.log(formData, "multichains");
      if (formData.multichains.length > 0) {
        let totalFee = ethers.utils.parseEther("0");
        for (let i = 0; i < formData.multichains.length; i++) {
          domains.push(axelarDomains[formData.multichains[i].chainName]);
          fees.push(ethers.utils.parseEther("0.01"));
          totalFee = totalFee.add(fees[i]);
        }

        const { hash } = await writeContract({
          address: contractAddress,
          abi: deployerAbi,
          functionName: "xDeployer",
          args: [
            contractAddress,
            domains,
            saltbytes,
            bytecode,
            fees,
            false,
            "0x",
            totalFee,
          ],
          value: totalFee,
        });
        console.log(hash, "tx");

        // await waitForTransaction(data);
        setTxhash(hash);
        setDeploymentSuccess(true);
      }
    } catch (err) {
      console.log(err, "DeployContract");
      setStartDeploying(false);
    }
  };

  return (
    <div>
      <Backdrop onClose={onClose} />
      <div className="w-[550px] bg-[#111111] p-10 rounded-2xl absolute top-[50%] left-[50%] shadow-md -translate-x-[50%] -translate-y-[50%] z-10 rounded-b-2xl  overflow-hidden border border-gray-800">
        {startDeploying ? (
          <div className="flex flex-col justify-center items-center gap-4">
            <AiOutlineDeploymentUnit color="white" size={80} />
            <p className="text-green-300 text-sm">
              {deploymentSuccess
                ? "Deployment Success"
                : "Deploying Contract..."}
            </p>

            {deploymentSuccess && (
              <button
                onClick={() => {
                  window.open(
                    `https://testnet.axelarscan.io/gmp/${txhash}`,
                    "_blank"
                  );
                }}
                className="py-3 px-7 rounded-md bg-[#1F423A] hover:bg-[#1a3831] text-green-300 border border-gray-600 mt-4 w-full"
              >
                View on Axelar Explorer
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex flex-col justify-center items-center gap-4">
              <AiOutlineDeploymentUnit color="white" size={80} />
              <p className="text-green-300 text-sm">
                {generatingAddress
                  ? computedAddress
                    ? "Generated Address"
                    : "Generating Address..."
                  : "Generate Address"}
              </p>
            </div>

            <>
              <p className="text-xs text-gray-400 mt-6 mb-1">
                Enter the salt value
              </p>
              <input
                className="py-2 px-2  text-gray-400 border border-gray-700 rounded-md w-full focus:outline-none bg-transparent"
                type="number"
                id="salt"
                onChange={(e) => setSalt(e.target.value)}
              ></input>

              {computedAddress !== "" && (
                <div>
                  <p className="text-xs text-gray-400 mt-6 mb-1">
                    Generated Address
                  </p>
                  <p className="py-3 px-2 flex items-center justify-between border text-gray-400 border-gray-700 rounded-md w-full">
                    {computedAddress}{" "}
                    <span>
                      <AiFillCopy
                        className="cursor-pointer"
                        size={22}
                        onClick={() => {
                          navigator.clipboard.writeText(computedAddress);
                        }}
                      />
                    </span>
                  </p>
                </div>
              )}
              <button
                onClick={generateAddressHandler}
                className="py-3 px-7 rounded-md bg-[#191919] hover:bg-[#111111] text-gray-300 border border-gray-600 mt-4 w-full"
              >
                Generate Address
              </button>
              <p className="text-xs mt-1 text-gray-400 text-center">
                Generate an address for your compiled contract
              </p>
            </>
            {computedAddress !== "" && (
              <div>
                <p className="text-xs text-gray-400 mt-4 mb-1">
                  If you like the address generated then you can go for
                  deployment otherwise you can alter the salt and generate new
                  address
                </p>
                <button
                  onClick={deployContractHandler}
                  className="py-3 px-7 rounded-md bg-[#1F423A] hover:bg-[#1a3831] text-green-300 border border-gray-600 mt-4 w-full"
                >
                  Deploy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {deploymentSuccess && <Confetti width={width} height={height} />}
    </div>
  );
};

export default DeployModal;
