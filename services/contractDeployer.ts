// services/contractDeployer.ts
import { ethers } from 'ethers';

export async function deployContract(
  abi: any[],
  bytecode: string,
  providerUrl: string,
  privateKey: string,
  constructorArgs: any[] = []
): Promise<{
  success: boolean;
  message: string;
  contractAddress?: string;
  txHash?: string;
}> {
  try {
    // Connect to the provider
    const provider = new ethers.JsonRpcProvider(providerUrl);
    
    // Create a wallet
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Create a contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    // Deploy the contract
    const contract = await factory.deploy(...constructorArgs);
    
    // Wait for deployment
    const receipt = await contract.deploymentTransaction().wait();
    
    return {
      success: true,
      message: 'Contract deployed successfully',
      contractAddress: contract.target,
      txHash: receipt.hash
    };
  } catch (error) {
    return {
      success: false,
      message: `Deployment error: ${error.message}`
    };
  }
}