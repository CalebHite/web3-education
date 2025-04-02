// components/contract-builder/ContractPreview.tsx
import { ContractFormData } from '@/types/contracts';

interface ContractPreviewProps {
  contractData: ContractFormData;
}

export default function ContractPreview({ contractData }: ContractPreviewProps) {
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
        code += `    ${variable.visibility} ${variable.type} ${variable.name}`;
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
          code += `${param.indexed ? 'indexed ' : ''}${param.type} ${param.name}`;
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
          code += '        // Function implementation\n';
        }
        code += '    }\n\n';
      });
    }

    code += '}';
    return code;
  };

  const solidityCode = generateSolidityCode(contractData);

  return (
    <pre className="font-mono text-sm bg-gray-800 text-gray-100 p-4 rounded-lg overflow-auto h-full">
      <code>{solidityCode}</code>
    </pre>
  );
}