// app/contract-deploy/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContractDeployment() {
  const router = useRouter();
  const [network, setNetwork] = useState('sepolia');
  const [privateKey, setPrivateKey] = useState('');
  const [constructorArgs, setConstructorArgs] = useState('[]');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // We would get the compiled contract from session/localStorage
  // In a real app, you might use more robust state management
  const getCompiledContract = () => {
    try {
      const storedData = localStorage.getItem('compiledContract');
      return storedData ? JSON.parse(storedData) : null;
    } catch (e) {
      return null;
    }
  };
  
  const compiledContract = getCompiledContract();
  
  const handleDeploy = async () => {
    if (!compiledContract || !privateKey) return;
    
    setLoading(true);
    try {
      // Parse constructor arguments
      const args = JSON.parse(constructorArgs);
      
      // Get provider URL based on network
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
      
      const data = await response.json();
      setResult(data);
    } catch (error: unknown) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!compiledContract) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
          <h2 className="text-lg font-semibold mb-2">No Compiled Contract Found</h2>
          <p>You need to compile a contract first.</p>
          <button
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded"
            onClick={() => router.push('/contract-builder')}
          >
            Go to Contract Builder
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Deploy Smart Contract</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Contract: {compiledContract.name}</h2>
            <p className="text-sm">ABI contains {compiledContract.abi?.length || 0} function(s)</p>
          </div>
          
          <div className="border p-4 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Network</label>
              <select
                className="w-full p-2 border rounded"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
              >
                <option value="sepolia">Sepolia (Testnet)</option>
                <option value="goerli">Goerli (Testnet)</option>
                <option value="local">Local (Hardhat)</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Private Key</label>
              <input
                type="password"
                className="w-full p-2 border rounded"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your private key"
              />
              <p className="text-xs text-gray-500 mt-1">Never share your private key. This is stored locally and not sent to our servers.</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Constructor Arguments (JSON array)</label>
              <textarea
                className="w-full p-2 border rounded font-mono h-32"
                value={constructorArgs}
                onChange={(e) => setConstructorArgs(e.target.value)}
                placeholder="Enter constructor arguments as a JSON array"
              />
            </div>

            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDeploy}
              disabled={loading || !privateKey}
            >
              {loading ? 'Deploying...' : 'Deploy Contract'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              <h2 className="text-lg font-semibold mb-2">
                {result.success ? 'Deployment Successful' : 'Deployment Failed'}
              </h2>
              {result.success ? (
                <div>
                  <p className="text-sm mb-2">Contract Address:</p>
                  <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                    {result.contractAddress}
                  </code>
                  <p className="text-sm mt-4">Transaction Hash:</p>
                  <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                    {result.transactionHash}
                  </code>
                </div>
              ) : (
                <p className="text-sm">{result.message}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}