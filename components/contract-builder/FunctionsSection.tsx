// components/contract-builder/FunctionsSection.tsx
"use client";

import { useState } from 'react';
import { FunctionDefinition, FunctionInput, FunctionOutput } from '@/types/contracts';

interface FunctionsSectionProps {
  functions: FunctionDefinition[];
  onUpdate: (functions: FunctionDefinition[]) => void;
}

export default function FunctionsSection({ functions, onUpdate }: FunctionsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [currentFunction, setCurrentFunction] = useState<FunctionDefinition>({
    name: '',
    inputs: [],
    outputs: [],
    visibility: 'public',
    stateMutability: 'nonpayable',
    code: ''
  });

  const addInput = () => {
    setCurrentFunction(prev => ({
      ...prev,
      inputs: [...prev.inputs, { name: '', type: 'uint256' }]
    }));
  };

  const addOutput = () => {
    setCurrentFunction(prev => ({
      ...prev,
      outputs: [...prev.outputs, { type: 'bool' }]
    }));
  };

  const updateInput = (index: number, input: FunctionInput) => {
    setCurrentFunction(prev => {
      const newInputs = [...prev.inputs];
      newInputs[index] = input;
      return { ...prev, inputs: newInputs };
    });
  };

  const updateOutput = (index: number, output: FunctionOutput) => {
    setCurrentFunction(prev => {
      const newOutputs = [...prev.outputs];
      newOutputs[index] = output;
      return { ...prev, outputs: newOutputs };
    });
  };

  const removeInput = (index: number) => {
    setCurrentFunction(prev => ({
      ...prev,
      inputs: prev.inputs.filter((_, i) => i !== index)
    }));
  };

  const removeOutput = (index: number) => {
    setCurrentFunction(prev => ({
      ...prev,
      outputs: prev.outputs.filter((_, i) => i !== index)
    }));
  };

  const saveFunction = () => {
    onUpdate([...functions, currentFunction]);
    setCurrentFunction({
      name: '',
      inputs: [],
      outputs: [],
      visibility: 'public',
      stateMutability: 'nonpayable',
      code: ''
    });
    setIsAdding(false);
  };

  const removeFunction = (index: number) => {
    onUpdate(functions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {isAdding ? (
        <div className="border rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={currentFunction.name}
                onChange={(e) => setCurrentFunction({...currentFunction, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Visibility</label>
                <select
                  className="w-full p-2 border rounded"
                  value={currentFunction.visibility}
                  onChange={(e) => setCurrentFunction({
                    ...currentFunction, 
                    visibility: e.target.value as FunctionDefinition['visibility']
                  })}
                >
                  <option value="public">public</option>
                  <option value="private">private</option>
                  <option value="internal">internal</option>
                  <option value="external">external</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Inputs</label>
              <button 
                type="button" 
                className="text-sm text-blue-600"
                onClick={addInput}
              >
                + Add Input
              </button>
            </div>
            
            {currentFunction.inputs.map((input, idx) => (
              <div key={idx} className="flex gap-2 mb-1">
                <input
                  type="text"
                  placeholder="Name"
                  className="flex-1 p-1 border rounded"
                  value={input.name}
                  onChange={(e) => updateInput(idx, {...input, name: e.target.value})}
                />
                <select
                  className="flex-1 p-1 border rounded"
                  value={input.type}
                  onChange={(e) => updateInput(idx, {...input, type: e.target.value})}
                >
                  <option value="uint256">uint256</option>
                  <option value="string">string</option>
                  <option value="address">address</option>
                  <option value="bool">bool</option>
                  <option value="bytes">bytes</option>
                </select>
                <button 
                  type="button" 
                  className="text-red-500"
                  onClick={() => removeInput(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Outputs</label>
              <button 
                type="button" 
                className="text-sm text-blue-600"
                onClick={addOutput}
              >
                + Add Output
              </button>
            </div>
            
            {currentFunction.outputs.map((output, idx) => (
              <div key={idx} className="flex gap-2 mb-1">
                <select
                  className="flex-1 p-1 border rounded"
                  value={output.type}
                  onChange={(e) => updateOutput(idx, {...output, type: e.target.value})}
                >
                  <option value="uint256">uint256</option>
                  <option value="string">string</option>
                  <option value="address">address</option>
                  <option value="bool">bool</option>
                  <option value="bytes">bytes</option>
                </select>
                <button 
                  type="button" 
                  className="text-red-500"
                  onClick={() => removeOutput(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Function Body</label>
            <textarea
              className="w-full p-2 border rounded font-mono h-24"
              value={currentFunction.code}
              placeholder="// Write Solidity code here"
              onChange={(e) => setCurrentFunction({...currentFunction, code: e.target.value})}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              className="bg-gray-200 py-1 px-3 rounded text-sm"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="bg-blue-600 text-white py-1 px-3 rounded text-sm disabled:bg-blue-300"
              disabled={!currentFunction.name}
              onClick={saveFunction}
            >
              Add Function
            </button>
          </div>
        </div>
      ) : (
        <button 
          type="button"
          className="text-blue-600 font-medium text-sm"
          onClick={() => setIsAdding(true)}
        >
          + Add Function
        </button>
      )}

      <div className="space-y-2">
        {functions.map((func, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-medium">{func.name}</span>
                <span className="text-sm text-gray-500 ml-2">({func.visibility})</span>
              </div>
              <button 
                type="button"
                className="text-red-500 text-sm"
                onClick={() => removeFunction(index)}
              >
                Remove
              </button>
            </div>
            <div className="text-sm text-gray-600">
              <div>Inputs: {func.inputs.map(input => `${input.type} ${input.name}`).join(', ') || 'none'}</div>
              <div>Outputs: {func.outputs.map(output => output.type).join(', ') || 'none'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}