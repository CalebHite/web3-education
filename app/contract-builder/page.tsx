// app/contract-builder/page.tsx
"use client";

import { useState } from 'react';
import { ContractFormData } from '@/types/contracts';
import ContractNameSection from '@/components/contract-builder/ContractNameSection';
import VariablesSection from '@/components/contract-builder/VariablesSection';
import FunctionsSection from '@/components/contract-builder/FunctionsSection';
import EventsSection from '@/components/contract-builder/EventsSection';
import ContractPreview from '@/components/contract-builder/ContractPreview';
import CreateSectionForm from '@/components/contract-builder/CreateSectionForm';
import { VariableDefinition, FunctionDefinition, EventDefinition } from '@/types/contracts';

type SectionType = 'variable' | 'function' | 'event';

interface Section {
  id: SectionType;
  title: string;
  component: React.ReactNode;
}

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

  const [showCreateSection, setShowCreateSection] = useState(false);
  const [selectedType, setSelectedType] = useState<SectionType>('variable');
  const [showOptions, setShowOptions] = useState(false);

  const addVariable = (newVariable: VariableDefinition) => {
    updateContractData({ 
      variables: [...contractData.variables, newVariable] 
    });
    setShowCreateSection(false);
  };

  const addFunction = (newFunction: FunctionDefinition) => {
    updateContractData({ 
      functions: [...contractData.functions, newFunction] 
    });
    setShowCreateSection(false);
  };

  const addEvent = (newEvent: EventDefinition) => {
    updateContractData({ 
      events: [...contractData.events, newEvent] 
    });
    setShowCreateSection(false);
  };

  const handleCreate = (data: VariableDefinition | FunctionDefinition | EventDefinition) => {
    switch (selectedType) {
      case 'variable':
        addVariable(data as VariableDefinition);
        break;
      case 'function':
        addFunction(data as FunctionDefinition);
        break;
      case 'event':
        addEvent(data as EventDefinition);
        break;
    }
  };

  const updateContractData = (newData: Partial<ContractFormData>) => {
    setContractData(prev => ({ ...prev, ...newData }));
  };

  const [sectionsList] = useState<Section[]>([
    {
      id: 'variable',
      title: 'Contract Variables',
      component: (
        <VariablesSection 
          variables={contractData.variables} 
          onUpdate={(variables: VariableDefinition[]) => updateContractData({ variables })}
          onAddFunction={(function_: FunctionDefinition) => updateContractData({ 
            functions: [...contractData.functions, function_] 
          })}
          onAddEvent={(event: EventDefinition) => updateContractData({ 
            events: [...contractData.events, event] 
          })}
        />
      )
    },
    {
      id: 'function',
      title: 'Contract Functions',
      component: (
        <FunctionsSection 
          functions={contractData.functions} 
          onUpdate={(functions: FunctionDefinition[]) => updateContractData({ functions })} 
        />
      )
    },
    {
      id: 'event',
      title: 'Contract Events',
      component: (
        <EventsSection 
          events={contractData.events} 
          onUpdate={(events: EventDefinition[]) => updateContractData({ events })} 
        />
      )
    }
  ]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Smart Contract Builder</h1>
      
      <div className="max-w-4xl">
        <div className="space-y-4">
          <ContractNameSection 
            contractData={contractData}
            onUpdate={(data) => updateContractData(data)} 
          />
          <div className="space-y-2">
            <div className="flex justify-end">
              {showCreateSection ? (
                <button
                  onClick={() => setShowCreateSection(false)}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center text-2xl transition-transform duration-200 hover:scale-110"
                  >
                    +
                  </button>
                  {showOptions && (
                    <div className="absolute bottom-full right-0 mb-2 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedType('variable');
                          setShowCreateSection(true);
                          setShowOptions(false);
                        }}
                        className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
                      >
                        Variable
                      </button>
                      <button
                        onClick={() => {
                          setSelectedType('function');
                          setShowCreateSection(true);
                          setShowOptions(false);
                        }}
                        className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
                      >
                        Function
                      </button>
                      <button
                        onClick={() => {
                          setSelectedType('event');
                          setShowCreateSection(true);
                          setShowOptions(false);
                        }}
                        className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
                      >
                        Event
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {showCreateSection && (
              <CreateSectionForm
                title={`Create New ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`}
                onSubmit={handleCreate}
                onCancel={() => setShowCreateSection(false)}
                type={selectedType}
              />
            )}
          </div>

          <div className="space-y-4">
            {sectionsList.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                </div>
                <div className="p-4">
                  {section.component}
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 cursor-pointer"
            onClick={() => console.log("Compile contract", contractData)}
          >
            Generate & Compile Contract
          </button>
        </div>
      </div>

      <ContractPreview contractData={contractData} />
    </div>
  );
}