// app/contract-builder/page.tsx
"use client";

import { useState } from 'react';
import { ContractFormData } from '@/types/contracts';
import ContractNameSection from '@/components/contract-builder/ContractNameSection';
import VariablesSection from '@/components/contract-builder/VariablesSection';
import FunctionsSection from '@/components/contract-builder/FunctionsSection';
import EventsSection from '@/components/contract-builder/EventsSection';
import ContractPreview from '@/components/contract-builder/ContractPreview';

export default function ContractBuilder() {
  const [contractData, setContractData] = useState<ContractFormData>({
    name: 'MyToken',
    variables: [{ name: 'totalSupply', type: 'uint256', visibility: 'private' }],
    functions: [{ 
      name: 'mint', 
      inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], 
      outputs: [{ type: 'bool' }],
      visibility: 'public',
      stateMutability: 'nonpayable'
    }],
    events: [{ 
      name: 'Transfer', 
      parameters: [
        { name: 'from', type: 'address', indexed: true },
        { name: 'to', type: 'address', indexed: true },
        { name: 'value', type: 'uint256', indexed: false }
      ] 
    }],
    inherits: ['ERC20'],
  });

  const updateContractData = (newData: Partial<ContractFormData>) => {
    setContractData(prev => ({ ...prev, ...newData }));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Smart Contract Builder</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ContractNameSection 
            contractData={contractData}
            onUpdate={(data) => updateContractData(data)} 
          />
          
          <VariablesSection 
            variables={contractData.variables} 
            onUpdate={(variables) => updateContractData({ variables })} 
          />
          
          <FunctionsSection 
            functions={contractData.functions} 
            onUpdate={(functions) => updateContractData({ functions })} 
          />
          
          <EventsSection 
            events={contractData.events} 
            onUpdate={(events) => updateContractData({ events })} 
          />
          
          <button 
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            onClick={() => console.log("Compile contract", contractData)}
          >
            Generate & Compile Contract
          </button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Contract Preview</h2>
          <ContractPreview contractData={contractData} />
        </div>
      </div>
    </div>
  );
}