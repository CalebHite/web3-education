import React from 'react';
import { ContractFormData } from '@/types/contracts';

interface ContractNameSectionProps {
  contractData: ContractFormData;
  onUpdate: (data: Partial<ContractFormData>) => void;
}

export default function ContractNameSection({ contractData, onUpdate }: ContractNameSectionProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ name: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="contractName" className="block text-sm font-medium text-gray-700">
          Contract Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="contractName"
            id="contractName"
            value={contractData.name}
            onChange={handleNameChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter contract name"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          The name of your smart contract. This will be used as the contract class name in Solidity.
        </p>
      </div>
    </div>
  );
} 