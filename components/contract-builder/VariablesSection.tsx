import { useState } from 'react';
import { VariableDefinition, FunctionDefinition, EventDefinition } from '@/types/contracts';

interface VariablesSectionProps {
  variables: VariableDefinition[];
  onUpdate: (variables: VariableDefinition[]) => void;
  onAddFunction: (function_: FunctionDefinition) => void;
  onAddEvent: (event: EventDefinition) => void;
}

export default function VariablesSection({ variables, onUpdate, onAddFunction, onAddEvent }: VariablesSectionProps) {
  const addVariable = () => {
    const newVariable: VariableDefinition = {
      name: `variable${variables.length + 1}`,
      type: 'uint256',
      visibility: 'private',
      constant: false
    };
    onUpdate([...variables, newVariable]);
  };

  const updateVariable = (index: number, field: keyof VariableDefinition, value: any) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = {
      ...updatedVariables[index],
      [field]: value,
    };
    onUpdate(updatedVariables);
  };

  const removeVariable = (index: number) => {
    const updatedVariables = variables.filter((_, i) => i !== index);
    onUpdate(updatedVariables);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={addVariable}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
        >
          Add Variable
        </button>
      </div>
      <div className="space-y-2">
        {variables.map((variable, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={variable.name}
                  onChange={(e) => updateVariable(index, 'name', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={variable.type}
                  onChange={(e) => updateVariable(index, 'type', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="uint256">uint256</option>
                  <option value="int256">int256</option>
                  <option value="address">address</option>
                  <option value="bool">bool</option>
                  <option value="string">string</option>
                  <option value="bytes">bytes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Visibility</label>
                <select
                  value={variable.visibility}
                  onChange={(e) => updateVariable(index, 'visibility', e.target.value as 'public' | 'private' | 'internal' | 'external')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="public">public</option>
                  <option value="private">private</option>
                  <option value="internal">internal</option>
                  <option value="external">external</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={variable.constant || false}
                    onChange={(e) => updateVariable(index, 'constant', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Constant</span>
                </label>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Default Value</label>
              <input
                type="text"
                value={variable.defaultValue || ''}
                onChange={(e) => updateVariable(index, 'defaultValue', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 w-1/2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => removeVariable(index)}
              className="mt-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm cursor-pointer"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 