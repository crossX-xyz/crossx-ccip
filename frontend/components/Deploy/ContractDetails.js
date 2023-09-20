import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../node_modules/highlight.js/styles/railscasts.css";
import Highlight from "react-highlight";

const ContractDetails = ({ setPage, formData, setFormData }) => {
  const [contract, setContract] = useState("");
  const router = useRouter();

  const { hash } = router.query;
  console.log("hash is", hash);
  const getData = async () => {
    try {
      const res = await fetch(`https://ipfs.io/ipfs/${hash}/contract.json`);
      const data = await res.json();
      setFormData({
        ...formData,
        contractPasted: data?.contract,
        bytecode: data.bytecode,
        abi: data.abi,
      });
      setContract(data?.contract);
    } catch (err) {
      console.log("err is", err);
    }
  };

  useEffect(() => {
    if (hash) {
      getData();
    }
  }, [hash]);

  console.log("formdata is", formData);
  const nextPageHandler = () => {
    setPage((currPage) => currPage + 1);
  };

  const previousPageHandler = () => {
    setPage((currPage) => currPage - 1);
  };
  return (
    <div className="text-white w-[full] bg-[#1E1E1E] py-10 px-10 rounded-2xl border border-gray-700">
      <h2 className="text-2xl font-semibold mb-7">Contract details</h2>
      <div className="mt-5 rounded-md overflow-hidden">
        <Highlight className={`${styles}`} innerHTML={false}>
          {contract !== "" && contract}
        </Highlight>
          
      </div>
      <div className="flex flex-col ">
        <div className="flex justify-between mt-6">
          <p></p>
          <button
            onClick={nextPageHandler}
            type="button"
            className="py-3 px-7 rounded-md bg-[#161616] hover:bg-[#111111] text-gray-300 border border-gray-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractDetails;
