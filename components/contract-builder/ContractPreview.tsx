// components/contract-builder/ContractPreview.tsx
import { ContractFormData } from '@/types/contracts';
import { useState } from 'react';
import { Maximize2, Minimize2 } from "lucide-react";

interface ContractPreviewProps {
  contractData: ContractFormData;
}

export default function ContractPreview({ contractData }: ContractPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const generateSolidityCode = (data: ContractFormData): string => {
    let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

`;

    // Add imports if inheriting from OpenZeppelin
    if (data.inherits && data.inherits.length > 0) {
      data.inherits.forEach(contract => {
        if (contract.startsWith('ERC')) {
          code += `import "@openzeppelin/contracts/token/${contract}/${contract}.sol";\n`;
        }
      });
      code += '\n';
    }

    // Contract declaration with inheritance
    code += `contract ${data.name}`;
    if (data.inherits && data.inherits.length > 0) {
      code += ` is ${data.inherits.join(', ')}`;
    }
    code += ' {\n';

    // Variables
    if (data.variables.length > 0) {
      code += '    // State variables\n';
      data.variables.forEach(variable => {
        code += `    ${variable.type} ${variable.visibility} ${variable.name}`;
        if (variable.defaultValue) {
          code += ` = ${variable.defaultValue}`;
        }
        code += ';\n';
      });
      code += '\n';
    }

    // Events
  if (data.events.length > 0) {
    code += '    // Events\n';
    data.events.forEach(event => {
      code += `    event ${event.name}(`;
      event.parameters.forEach((param, idx) => {
        if (idx > 0) code += ', ';
        code += `${param.type} ${param.indexed ? 'indexed ' : ''}${param.name}`;
      });
      code += ');\n';
    });
    code += '\n';
  }

    // Functions
    if (data.functions.length > 0) {
      code += '    // Functions\n';
      data.functions.forEach(func => {
        code += `    ${func.visibility} ${func.stateMutability !== 'nonpayable' ? func.stateMutability + ' ' : ''}function ${func.name}(`;
        
        // Function inputs
        func.inputs.forEach((input, idx) => {
          if (idx > 0) code += ', ';
          code += `${input.type} ${input.name}`;
        });
        code += ')';
        
        // Function outputs
        if (func.outputs.length > 0) {
          code += ' returns (';
          func.outputs.forEach((output, idx) => {
            if (idx > 0) code += ', ';
            code += output.type;
            if (output.name) code += ' ' + output.name;
          });
          code += ')';
        }
        
        code += ' {\n';
        // Function body
        if (func.code) {
          const indentedCode = func.code
            .split('\n')
            .map(line => `        ${line}`)
            .join('\n');
          code += indentedCode + '\n';
        } else {
          code += '        // TODO: Implement function\n';
        }
        code += '    }\n\n';
      });
    }

    code += '}';
    console.log(code);
    return code;
  };

  const solidityCode = generateSolidityCode(contractData);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-150">
      <div 
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ maxHeight: isExpanded ? '80vh' : 'auto' }}
      >
        <div 
          className="flex justify-between items-center p-3 bg-zinc-800 text-white cursor-pointer hover:bg-zinc-700"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="text-sm font-semibold">Contract Preview</h2>
          <button className="text-white hover:text-gray-200 cursor-pointer">
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
        {isExpanded && (
          <div className="p-3 bg-zinc-900">
            <pre className="font-mono text-xs text-gray-100 overflow-auto" style={{ maxHeight: 'calc(80vh - 40px)' }}>
              <code>{solidityCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}