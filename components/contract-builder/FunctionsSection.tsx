// components/contract-builder/FunctionsSection.tsx
"use client";

import { FunctionDefinition, FunctionInput, FunctionOutput } from '@/types/contracts';

interface FunctionsSectionProps {
  functions: FunctionDefinition[];
  onUpdate: (functions: FunctionDefinition[]) => void;
}

export default function FunctionsSection({ functions, onUpdate }: FunctionsSectionProps) {
  const removeFunction = (index: number) => {
    onUpdate(functions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {functions.map((func, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium">{func.name}</h3>
            <button
              onClick={() => removeFunction(index)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
          {/* Display function details */}
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
  );
}