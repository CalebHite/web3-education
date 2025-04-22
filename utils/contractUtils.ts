import { ContractFormData } from '@/types/contracts';

export const generateSolidityCode = (data: ContractFormData): string => {
  const inherits = data.inherits && data.inherits.length > 0 ? ` is ${data.inherits.join(', ')}` : '';
  
  const variables = data.variables.map(v => 
    `    ${v.visibility} ${v.type} ${v.name};`
  ).join('\n');
  
  const functions = data.functions.map(f => {
    const inputs = f.inputs.map(i => `${i.type} ${i.name}`).join(', ');
    const outputs = f.outputs.map(o => o.type).join(', ');
    const returnType = outputs ? ` returns (${outputs})` : '';
    
    let functionBody = '';
    if (f.name === 'mint') {
      functionBody = `
        require(to != address(0), "Invalid address");
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
        return true;
      `;
    } else {
      functionBody = `// Function implementation`;
    }
    
    return `    ${f.visibility} ${f.stateMutability} function ${f.name}(${inputs})${returnType} {
        ${functionBody}
    }`;
  }).join('\n\n');
  
  const events = data.events.map(e => {
    const params = e.parameters.map(p => 
      `${p.type} ${p.indexed ? 'indexed ' : ''}${p.name}`
    ).join(', ');
    
    return `    event ${e.name}(${params});`;
  }).join('\n');
  
  return `// SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

    contract ${data.name} is ERC20 {
        // Constructor to initialize the token name, symbol, and mint initial supply
        constructor() ERC20("${data.tokenName}", "${data.tokenSymbol}") {
            _mint(msg.sender, ${data.initialSupply} * 10 ** decimals());
        }

        // Custom function to transfer tokens (though unnecessary, as ERC20 already provides transfer)
        function customTransfer(address to, uint256 amount) public {
            require(balanceOf(msg.sender) >= amount, "Insufficient balance");
            _transfer(msg.sender, to, amount);
        }
    }`;
};

export const compileContract = async (contractData: ContractFormData) => {
  const solidityCode = generateSolidityCode(contractData);
  
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
  
  return response.json();
};

export const deployContract = async (compiledContract: any, network: string, privateKey: string, constructorArgs: string) => {
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

  return response.json();
};