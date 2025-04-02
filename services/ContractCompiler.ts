// services/contractCompiler.ts
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ContractFormData } from '@/types/contracts';

const execAsync = promisify(exec);

export async function compileContract(contractData: ContractFormData): Promise<{
  success: boolean;
  message: string;
  artifacts?: any;
}> {
  try {
    // Generate Solidity code
    const solidityCode = generateSolidityCode(contractData);
    
    // Write to temp file
    const contractsDir = path.join(process.cwd(), 'contracts');
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }
    
    const contractPath = path.join(contractsDir, `${contractData.name}.sol`);
    fs.writeFileSync(contractPath, solidityCode);
    
    // Compile with Hardhat
    const { stdout, stderr } = await execAsync('npx hardhat compile');
    
    if (stderr) {
      return {
        success: false,
        message: `Compilation error: ${stderr}`
      };
    }
    
    // Read the compiled artifact
    const artifactPath = path.join(
      process.cwd(), 
      'app/artifacts/contracts', 
      `${contractData.name}.sol`, 
      `${contractData.name}.json`
    );
    
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      return {
        success: true,
        message: 'Contract compiled successfully',
        artifacts: artifact
      };
    } else {
      return {
        success: false,
        message: 'Compilation succeeded but artifact not found'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

// Helper function to generate Solidity code (same as in ContractPreview)
function generateSolidityCode(data: ContractFormData): string {
  // Use the same implementation as in the ContractPreview component
  // to ensure consistency
  // This is the same code generation logic shown earlier
  // ...
}