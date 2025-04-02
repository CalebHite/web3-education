import { useState } from 'react';
import { VariableDefinition, FunctionDefinition, EventDefinition } from '@/types/contracts';

type SectionType = 'variable' | 'function' | 'event';

interface CreateSectionFormProps {
  onCancel: () => void;
  onSubmit: (data: VariableDefinition | FunctionDefinition | EventDefinition) => void;
  title: string;
  type: SectionType;
}

const QUICK_FUNCTION_TEMPLATES = [
  {
    name: 'mint',
    template: {
      name: 'mint',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [],
      visibility: 'public',
      stateMutability: 'nonpayable',
      code: '// Mint tokens\n_mint(to, amount);'
    }
  },
  {
    name: 'transfer',
    template: {
      name: 'transfer',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ type: 'bool' }],
      visibility: 'public',
      stateMutability: 'nonpayable',
      code: '// Transfer tokens\nreturn _transfer(msg.sender, to, amount);'
    }
  },
  {
    name: 'deposit',
    template: {
      name: 'deposit',
      inputs: [],
      outputs: [],
      visibility: 'public',
      stateMutability: 'payable',
      code: '// Handle deposit\nrequire(msg.value > 0, "Must send ETH");\n// Add your deposit logic here'
    }
  },
  {
    name: 'withdraw',
    template: {
      name: 'withdraw',
      inputs: [{ name: 'amount', type: 'uint256' }],
      outputs: [],
      visibility: 'public',
      stateMutability: 'nonpayable',
      code: '// Handle withdrawal\nrequire(amount > 0, "Amount must be positive");\n// Add your withdrawal logic here'
    }
  }
];

export default function CreateSectionForm({ onCancel, onSubmit, title, type }: CreateSectionFormProps) {
  const [formData, setFormData] = useState<any>(() => {
    switch (type) {
      case 'variable':
        return {
          name: '',
          type: 'uint256',
          visibility: 'private',
          constant: false,
        };
      case 'function':
        return {
          name: '',
          inputs: [],
          outputs: [],
          visibility: 'public',
          stateMutability: 'nonpayable',
          code: ''
        };
      case 'event':
        return {
          name: '',
          parameters: [],
        };
      default:
        return {};
    }
  });

  const handleSubmit = () => {
    if (!formData.name) return;
    
    // Create a copy of the form data to submit
    const dataToSubmit = { ...formData };
    
    // Submit the data
    onSubmit(dataToSubmit);
    
    // Then reset the form
    setFormData(() => {
      switch (type) {
        case 'variable':
          return {
            name: '',
            type: 'uint256',
            visibility: 'private',
            constant: false,
          };
        case 'function':
          return {
            name: '',
            inputs: [],
            outputs: [],
            visibility: 'public',
            stateMutability: 'nonpayable',
            code: ''
          };
        case 'event':
          return {
            name: '',
            parameters: [],
          };
        default:
          return {};
      }
    });
  };

  const addParameter = () => {
    if (type === 'event') {
      setFormData(prev => ({
        ...prev,
        parameters: [...prev.parameters, { name: '', type: 'uint256', indexed: false }]
      }));
    }
  };

  const addInput = () => {
    if (type === 'function') {
      setFormData(prev => ({
        ...prev,
        inputs: [...prev.inputs, { name: '', type: 'uint256' }]
      }));
    }
  };

  const addOutput = () => {
    if (type === 'function') {
      setFormData(prev => ({
        ...prev,
        outputs: [...prev.outputs, { type: 'bool' }]
      }));
    }
  };

  const updateParameter = (index: number, field: string, value: any) => {
    if (type === 'event') {
      setFormData(prev => {
        const newParameters = [...prev.parameters];
        newParameters[index] = { ...newParameters[index], [field]: value };
        return { ...prev, parameters: newParameters };
      });
    }
  };

  const updateInput = (index: number, field: string, value: any) => {
    if (type === 'function') {
      setFormData(prev => {
        const newInputs = [...prev.inputs];
        newInputs[index] = { ...newInputs[index], [field]: value };
        return { ...prev, inputs: newInputs };
      });
    }
  };

  const updateOutput = (index: number, value: string) => {
    if (type === 'function') {
      setFormData(prev => {
        const newOutputs = [...prev.outputs];
        newOutputs[index] = { type: value };
        return { ...prev, outputs: newOutputs };
      });
    }
  };

  const removeParameter = (index: number) => {
    if (type === 'event') {
      setFormData(prev => ({
        ...prev,
        parameters: prev.parameters.filter((_, i) => i !== index)
      }));
    }
  };

  const removeInput = (index: number) => {
    if (type === 'function') {
      setFormData(prev => ({
        ...prev,
        inputs: prev.inputs.filter((_, i) => i !== index)
      }));
    }
  };

  const removeOutput = (index: number) => {
    if (type === 'function') {
      setFormData(prev => ({
        ...prev,
        outputs: prev.outputs.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-blue-200 mb-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter name"
          />
        </div>

        {(type === 'variable' || type === 'function') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Visibility</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="public">public</option>
              <option value="private">private</option>
              <option value="internal">internal</option>
              <option value="external">external</option>
            </select>
          </div>
        )}
      </div>

      {/* Variable specific fields */}
      {type === 'variable' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.constant}
                  onChange={(e) => setFormData({ ...formData, constant: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Constant</span>
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Default Value</label>
            <input
              type="text"
              value={formData.defaultValue || ''}
              onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter default value (optional)"
            />
          </div>
        </>
      )}

      {/* Function specific fields */}
      {type === 'function' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Quick Functions</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_FUNCTION_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, ...template.template })}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 text-sm"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Inputs</label>
              <button 
                type="button" 
                className="text-sm text-blue-600"
                onClick={addInput}
              >
                + Add Input
              </button>
            </div>
            
            {formData.inputs.map((input: any, idx: number) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Name"
                  className="flex-1 p-2 border rounded"
                  value={input.name}
                  onChange={(e) => updateInput(idx, 'name', e.target.value)}
                />
                <select
                  className="flex-1 p-2 border rounded"
                  value={input.type}
                  onChange={(e) => updateInput(idx, 'type', e.target.value)}
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

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Outputs</label>
              <button 
                type="button" 
                className="text-sm text-blue-600"
                onClick={addOutput}
              >
                + Add Output
              </button>
            </div>
            
            {formData.outputs.map((output: any, idx: number) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  className="flex-1 p-2 border rounded"
                  value={output.type}
                  onChange={(e) => updateOutput(idx, e.target.value)}
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

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Function Body</label>
            <textarea
              className="w-full p-2 border rounded font-mono h-32"
              value={formData.code}
              placeholder="// Write Solidity code here"
              onChange={(e) => setFormData({...formData, code: e.target.value})}
            />
          </div>
        </>
      )}

      {/* Event specific fields */}
      {type === 'event' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Parameters</label>
            <button 
              type="button" 
              className="text-sm text-blue-600"
              onClick={addParameter}
            >
              + Add Parameter
            </button>
          </div>
          
          {formData.parameters.map((parameter: any, idx: number) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Name"
                className="flex-1 p-2 border rounded"
                value={parameter.name}
                onChange={(e) => updateParameter(idx, 'name', e.target.value)}
              />
              <select
                className="flex-1 p-2 border rounded"
                value={parameter.type}
                onChange={(e) => updateParameter(idx, 'type', e.target.value)}
              >
                <option value="uint256">uint256</option>
                <option value="string">string</option>
                <option value="address">address</option>
                <option value="bool">bool</option>
                <option value="bytes">bytes</option>
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={parameter.indexed}
                  onChange={(e) => updateParameter(idx, 'indexed', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Indexed</span>
              </label>
              <button 
                type="button" 
                className="text-red-500"
                onClick={() => removeParameter(idx)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-medium"
        >
          Create {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      </div>
    </div>
  );
} 