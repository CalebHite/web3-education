// components/contract-builder/FunctionsSection.tsx
"use client";

import { useState } from 'react';
import { FunctionDefinition, VariableDefinition } from '@/types/contracts';

interface FunctionsSectionProps {
  functions: FunctionDefinition[];
  variables: VariableDefinition[];
  onUpdate: (functions: FunctionDefinition[]) => void;
}

interface FunctionInput {
  name: string;
  type: string;
  isConstant?: boolean;
  defaultValue?: string;
}

const PREDEFINED_FUNCTIONS = [
  {
    name: 'mint',
    template: {
      name: 'mint',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'maxSupply', type: 'uint256', isConstant: true, defaultValue: '1000000' }
      ],
      outputs: [],
      visibility: 'public' as const,
      stateMutability: 'nonpayable' as const,
      code: '// Mint tokens\nrequire(totalSupply() + amount <= maxSupply, "Exceeds max supply");\n_mint(to, amount);'
    }
  },
  {
    name: 'transfer',
    template: {
      name: 'transfer',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'minAmount', type: 'uint256', isConstant: true, defaultValue: '1' }
      ],
      outputs: [{ type: 'bool' }],
      visibility: 'public' as const,
      stateMutability: 'nonpayable' as const,
      code: '// Transfer tokens\nrequire(amount >= minAmount, "Amount too small");\nreturn _transfer(msg.sender, to, amount);'
    }
  },
  {
    name: 'deposit',
    template: {
      name: 'deposit',
      inputs: [
        { name: 'minDeposit', type: 'uint256', isConstant: true, defaultValue: '0.1' }
      ],
      outputs: [],
      visibility: 'public' as const,
      stateMutability: 'payable' as const,
      code: '// Handle deposit\nrequire(msg.value >= minDeposit * 1e18, "Deposit too small");\n// Add your deposit logic here'
    }
  },
  {
    name: 'withdraw',
    template: {
      name: 'withdraw',
      inputs: [
        { name: 'amount', type: 'uint256' },
        { name: 'maxWithdraw', type: 'uint256', isConstant: true, defaultValue: '1000' }
      ],
      outputs: [],
      visibility: 'public' as const,
      stateMutability: 'nonpayable' as const,
      code: '// Handle withdrawal\nrequire(amount > 0 && amount <= maxWithdraw, "Invalid withdrawal amount");\n// Add your withdrawal logic here'
    }
  }
];

export default function FunctionsSection({ functions, variables, onUpdate }: FunctionsSectionProps) {
  const [showAddFunction, setShowAddFunction] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedVariables, setSelectedVariables] = useState<Record<string, string>>({});

  const addFunction = () => {
    if (!selectedTemplate) return;

    const template = PREDEFINED_FUNCTIONS.find(f => f.name === selectedTemplate)?.template;
    if (!template) return;

    // Create a new function based on the template
    const newFunction: FunctionDefinition = {
      ...template,
      inputs: template.inputs.map(input => ({
        ...input,
        defaultValue: input.isConstant ? input.defaultValue : undefined
      })),
      code: template.code
    };

    onUpdate([...functions, newFunction]);
    setShowAddFunction(false);
    setSelectedTemplate('');
    setSelectedVariables({});
  };

  const removeFunction = (index: number) => {
    onUpdate(functions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddFunction(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
        >
          Add Function
        </button>
      </div>

      {showAddFunction && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Add New Function</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Function to Use</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                <option value="">Choose a Function...</option>
                {PREDEFINED_FUNCTIONS.map((func) => (
                  <option key={func.name} value={func.name}>
                    {func.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <div>
                <label className="block text-sm font-medium mb-1">Function Parameters</label>
                <div className="space-y-4">
                  {PREDEFINED_FUNCTIONS.find(f => f.name === selectedTemplate)?.template.inputs.map((input, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">
                          {input.name} ({input.type})
                          {input.isConstant && ' (Constant)'}
                        </label>
                        {input.isConstant ? (
                          <input
                            type="text"
                            value={input.defaultValue || ''}
                            onChange={(e) => {
                              const newInputs = [...PREDEFINED_FUNCTIONS.find(f => f.name === selectedTemplate)?.template.inputs || []];
                              newInputs[index] = { ...input, defaultValue: e.target.value };
                              // Update the template with new constant value
                              const updatedTemplate = PREDEFINED_FUNCTIONS.find(f => f.name === selectedTemplate)?.template;
                              if (updatedTemplate) {
                                updatedTemplate.inputs = newInputs;
                              }
                            }}
                            className="w-full p-2 border rounded"
                            placeholder="Enter constant value"
                          />
                        ) : (
                          <select
                            className="w-full p-2 border rounded"
                            value={selectedVariables[input.name] || ''}
                            onChange={(e) => {
                              setSelectedVariables(prev => ({
                                ...prev,
                                [input.name]: e.target.value
                              }));
                            }}
                          >
                            <option value="">Select variable...</option>
                            {variables.map((variable) => (
                              <option key={variable.name} value={variable.name}>
                                {variable.name} ({variable.type})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAddFunction(false);
                  setSelectedTemplate('');
                  setSelectedVariables({});
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={addFunction}
                disabled={!selectedTemplate}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Add Function
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {functions.map((func, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">{func.name}</h3>
              <button
                onClick={() => removeFunction(index)}
                className="text-red-500 hover:text-red-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-600">
              <p>Visibility: {func.visibility}</p>
              <p>State Mutability: {func.stateMutability}</p>
              {func.inputs.length > 0 && (
                <div className="mt-2">
                  <p>Inputs:</p>
                  <ul className="list-disc list-inside">
                    {func.inputs.map((input, i) => (
                      <li key={i}>{input.name}: {input.type}</li>
                    ))}
                  </ul>
                </div>
              )}
              {func.outputs.length > 0 && (
                <div className="mt-2">
                  <p>Outputs:</p>
                  <ul className="list-disc list-inside">
                    {func.outputs.map((output, i) => (
                      <li key={i}>{output.type}</li>
                    ))}
                  </ul>
                </div>
              )}
              {func.code && (
                <div className="mt-2">
                  <p>Code:</p>
                  <pre className="bg-gray-100 p-2 rounded mt-1">{func.code}</pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}