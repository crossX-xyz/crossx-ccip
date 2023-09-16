import ContractDetails from '@/components/Deploy/ContractDetails';
import MultiChain from '@/components/Deploy/MultiChain';
import SelectChain from '@/components/Deploy/SelectChain';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Web3Storage } from 'web3.storage';

const index = () => {
  const router = useRouter();
  const hash = router.query.hash;
  console.log('hash is', hash);
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    contractName: '',
    contractDescription: '',
    currentDeployChain: '',
    multichains: [],
    contractPasted: '',
    bytecode: '',
    abi: '',
  });

  const steps = ['Basic Details', 'Choose Chain', 'Multichain', 'Deploy'];

  const PageDisplay = () => {
    if (page === 1) {
      return (
        <ContractDetails
          setPage={setPage}
          page={page}
          formData={formData}
          setFormData={setFormData}
        />
      );
    } else if (page === 2) {
      return (
        <SelectChain
          setPage={setPage}
          page={page}
          formData={formData}
          setFormData={setFormData}
        />
      );
    } else if (page === 3) {
      return (
        <MultiChain
          setPage={setPage}
          page={page}
          formData={formData}
          setFormData={setFormData}
        />
      );
    }
  };

  return (
    <div className='bg-[#171717] min-h-screen flex items-center justify-center py-32'>
      <>{PageDisplay()}</>
    </div>
  );
};

export default index;
