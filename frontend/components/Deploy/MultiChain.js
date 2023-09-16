import Image from 'next/image';
import React, { useState } from 'react';
import polygonSvg from '../../public/assets/deploy/polygon.svg';
import avaImg from '../../public/assets/deploy/avalanche.png';
import optimismImg from '../../public/assets/deploy/optimism.png';
import bnbImg from '../../public/assets/deploy/bnb.png';
import arbImg from '../../public/assets/deploy/arbitrium.svg';
import DeployModal from './DeployModal';

const chains = [
  {
    id: '97',
    chainImg: bnbImg,
    chainName: 'BSC Testnet',
  },
  {
    id: '80001',
    chainImg: polygonSvg,
    chainName: 'Polygon Mumbai',
  },
  {
    id: '43113',
    chainImg: avaImg,
    chainName: 'Avalanche',
  },
  {
    id: '421613',
    chainImg: arbImg,
    chainName: 'Arbitrum',
  },
  {
    id: '420',
    chainImg: optimismImg,
    chainName: 'Optimism Goerli',
  },
  // {
  //   id: "3141",
  //   chainImg: fvmImg,
  //   chainName: "FVM Hyperspace",
  // },
];

const MultiChain = ({ formData, setFormData, page, setPage }) => {
  const [showCompileModal, setShowCompileModal] = useState(false);

  const [chainSelected, setChainSelected] = useState(formData.multichains);

  const nextPageHandler = () => {
    setFormData({ ...formData, multichains: chainSelected });

    if (formData?.bytecode) {
      setShowCompileModal(true);
    } else setPage((currPage) => currPage + 1);
  };

  const previousPageHandler = () => {
    setPage((currPage) => currPage - 1);
  };
  const closeModalHandler = () => {
    setShowCompileModal(false);
  };

  const setSelectedChain = (chain) => {
    let index = chainSelected.findIndex((c) => c.chainName === chain.chainName);

    if (index !== -1) {
      chainSelected.splice(index, 1);
      setChainSelected([...chainSelected]);
    } else {
      setChainSelected([...chainSelected, chain]);
    }
  };
  console.log(formData.bytecode, 'chainSelected');

  return (
    <div className='text-white w-[800px] bg-[#1E1E1E] py-10  px-10 rounded-2xl border border-gray-700'>
      <h2 className='text-2xl font-semibold mb-7'>Multichain</h2>

      <form className='flex flex-col'>
        <p className='text-sm text-gray-400 mb-1'>Choose multiple chain</p>

        <div className='flex flex-wrap justify-between gap-5 mt-2'>
          {chains.map((chain, index) => {
            let isChainSelected =
              chainSelected.findIndex((c) => c.chainName === chain.chainName) >=
              0;
            if (chain.chainName !== formData.currentDeployChain.chainName)
              return (
                <div
                  onClick={() => {
                    setSelectedChain(chain);
                  }}
                  className={`py-3 px-4 w-[300px] items-center flex gap-4 hover:bg-[#323131] bg-[#161616] cursor-pointer rounded-xl ${
                    isChainSelected && `bg-[#323131]`
                  }`}>
                  <Image
                    src={chain.chainImg}
                    alt={chain.chainName}
                    width={40}
                    height={40}
                  />
                  <div>
                    <h3 className='font-semibold'>{chain.chainName}</h3>
                    {/* <p className="text-[12px] tracking-wide text-gray-500">
                  {chain.chainAdd}
                </p> */}
                  </div>
                </div>
              );
          })}
        </div>
      </form>

      <div className='flex justify-between mt-6'>
        <button
          onClick={previousPageHandler}
          type='button'
          className='py-3 px-7 rounded-md bg-[#161616] hover:bg-[#111111] text-gray-300 border border-gray-600'>
          Back
        </button>
        <button
          onClick={() => nextPageHandler()}
          type='button'
          className='py-3 px-7 rounded-md bg-[#161616] hover:bg-[#111111] text-gray-300 border border-gray-600'>
          Next
        </button>
      </div>

      {formData?.bytecode && showCompileModal && (
        <DeployModal
          onClose={closeModalHandler}
          bytecode={formData.bytecode}
          abi={formData.abi}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </div>
  );
};

export default MultiChain;
