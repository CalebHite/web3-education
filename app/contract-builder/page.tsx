// app/contract-builder/page.tsx
"use client";

import { useState } from 'react';
import { ContractFormData } from '@/types/contracts';
import ContractNameSection from '@/components/contract-builder/ContractNameSection';
import VariablesSection from '@/components/contract-builder/VariablesSection';
import FunctionsSection from '@/components/contract-builder/FunctionsSection';
import EventsSection from '@/components/contract-builder/EventsSection';
import ContractPreview from '@/components/contract-builder/ContractPreview';
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

  // Add new states for deployment
  const [showDeployment, setShowDeployment] = useState(false);
  const [compiledContract, setCompiledContract] = useState<any>(null);
  const [network, setNetwork] = useState('sepolia');
  const [privateKey, setPrivateKey] = useState('');
  const [constructorArgs, setConstructorArgs] = useState('[]');
  const [deploymentResult, setDeploymentResult] = useState<any>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const addVariable = () => {
    const newVariable: VariableDefinition = {
      name: `variable${contractData.variables.length + 1}`,
      type: 'uint256',
      visibility: 'private',
      constant: false
    };
    updateContractData({ 
      variables: [...contractData.variables, newVariable] 
    });
  };

  const addEvent = () => {
    const newEvent: EventDefinition = {
      name: `Event${contractData.events.length + 1}`,
      parameters: [
        { name: 'value', type: 'uint256', indexed: false }
      ]
    };
    updateContractData({ 
      events: [...contractData.events, newEvent] 
    });
  };

  const updateContractData = (newData: Partial<ContractFormData>) => {
    setContractData(prev => ({ ...prev, ...newData }));
  };

  // Remove the useState for sectionsList and make it a derived value
  const sectionsList: Section[] = [
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
          variables={contractData.variables}
          events={contractData.events}
          onUpdate={(functions: FunctionDefinition[]) => updateContractData({ functions })} 
          onEventUpdate={(events: EventDefinition[]) => updateContractData({ events })}
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
  ];

  const handleCompileAndDeploy = async () => {
    try {
      // Generate Solidity contract code from contractData
      const solidityCode = generateSolidityCode(contractData);

      console.log(solidityCode);
      
      // Compile the contract using the Solidity compiler API
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCode: solidityCode,
          contractName: contractData.name,
        }),
      });

      const compilationResult = await response.json();
      
      if (!compilationResult.success) {
        throw new Error(compilationResult.error);
      }

      const compiledContract = {
        name: contractData.name,
        abi: compilationResult.abi,
        bytecode: compilationResult.bytecode,
      };
      
      // Store compilation result
      localStorage.setItem('compiledContract', JSON.stringify(compiledContract));
      setCompiledContract(compiledContract);
      setShowDeployment(true);
      
    } catch (error) {
      console.error('Compilation failed:', error);
      alert(`Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Helper function to generate Solidity code from contract data
  const generateSolidityCode = (data: ContractFormData): string => {
    const inherits = data.inherits && data.inherits.length > 0 ? ` is ${data.inherits.join(', ')}` : '';
    
    const variables = data.variables.map(v => 
      `    ${v.visibility} ${v.type} ${v.name};`
    ).join('\n');
    
    const functions = data.functions.map(f => {
      const inputs = f.inputs.map(i => `${i.type} ${i.name}`).join(', ');
      const outputs = f.outputs.map(o => o.type).join(', ');
      const returnType = outputs ? ` returns (${outputs})` : '';
      
      return `    ${f.visibility} ${f.stateMutability} function ${f.name}(${inputs})${returnType} {
          // Function implementation
      }`;
    }).join('\n\n');
    
    const events = data.events.map(e => {
      const params = e.parameters.map(p => 
        `${p.type} ${p.indexed ? 'indexed ' : ''}${p.name}`
      ).join(', ');
      
      return `    event ${e.name}(${params});`;
    }).join('\n');
    
    return `// SPDX-License-Identifier: MIT
      pragma solidity ^0.8.0;

      ${data.inherits?.map(i => `import "@openzeppelin/contracts/${i}.sol";`).join('\n') || ''}

      contract ${data.name}${inherits} {
      ${variables ? `\n    // State Variables\n${variables}\n` : ''}
      ${events ? `\n    // Events\n${events}\n` : ''}
      ${functions ? `\n    // Functions\n${functions}\n` : ''}
      }`;
  };

  const handleDeploy = async () => {
    if (!compiledContract || !privateKey) return;
    
    setIsDeploying(true);
    try {
      const args = JSON.parse(constructorArgs);
      
      const providerUrl = 
        network === 'sepolia' ? 'https://eth-sepolia.public.blastapi.io' :
        network === 'goerli' ? 'https://eth-goerli.public.blastapi.io' :
        'http://localhost:8545';
      
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          abi: compiledContract.abi,
          bytecode: compiledContract.bytecode,
          providerUrl,
          privateKey,
          constructorArgs: args,
        }),
      });
      
      const data = await response.json();
      setDeploymentResult(data);
    } catch (error: unknown) {
      setDeploymentResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Smart Contract Builder</h1>
      
      <div className="max-w-4xl">
        {!showDeployment ? (
          // Contract Builder UI
          <div className="space-y-4">
            <ContractNameSection 
              contractData={contractData}
              onUpdate={(data) => updateContractData(data)} 
            />
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
              onClick={handleCompileAndDeploy}
            >
              Generate & Compile Contract
            </button>

            <ContractPreview contractData={contractData} />
          </div>
        ) : (
          // Deployment UI
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Deploy Contract: {contractData.name}</h2>
              <button
                onClick={() => setShowDeployment(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back to Editor
              </button>
            </div>

            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Network</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                  >
                    <option value="sepolia">Sepolia (Testnet)</option>
                    <option value="goerli">Goerli (Testnet)</option>
                    <option value="local">Local (Hardhat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Private Key</label>
                  <input
                    type="password"
                    className="w-full p-2 border rounded"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter your private key"
                  />
                  <p className="text-xs text-gray-500 mt-1">Never share your private key. This is stored locally and not sent to our servers.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Constructor Arguments (JSON array)</label>
                  <textarea
                    className="w-full p-2 border rounded font-mono h-32"
                    value={constructorArgs}
                    onChange={(e) => setConstructorArgs(e.target.value)}
                    placeholder="Enter constructor arguments as a JSON array"
                  />
                </div>

                <button
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDeploy}
                  disabled={isDeploying || !privateKey}
                >
                  {isDeploying ? 'Deploying...' : 'Deploy Contract'}
                </button>

                {deploymentResult && (
                  <div className={`p-4 rounded-lg border ${
                    deploymentResult.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                  }`}>
                    <h3 className="text-lg font-semibold mb-2">
                      {deploymentResult.success ? 'Deployment Successful' : 'Deployment Failed'}
                    </h3>
                    {deploymentResult.success ? (
                      <div>
                        <p className="text-sm mb-2">Contract Address:</p>
                        <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                          {deploymentResult.contractAddress}
                        </code>
                        <p className="text-sm mt-4">Transaction Hash:</p>
                        <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                          {deploymentResult.transactionHash}
                        </code>
                      </div>
                    ) : (
                      <p className="text-sm">{deploymentResult.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}