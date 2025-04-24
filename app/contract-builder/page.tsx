// app/contract-builder/page.tsx
"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ContractFormData } from '@/types/contracts';
import ContractNameSection from '@/components/contract-builder/ContractNameSection';
import VariablesSection from '@/components/contract-builder/VariablesSection';
import FunctionsSection from '@/components/contract-builder/FunctionsSection';
import EventsSection from '@/components/contract-builder/EventsSection';
import ContractPreview from '@/components/contract-builder/ContractPreview';
import { VariableDefinition, FunctionDefinition, EventDefinition } from '@/types/contracts';
import { compileContract, deployContract } from '@/utils/contractUtils';

import Header from "@/components/Header";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SectionType = 'variable' | 'function' | 'event';

interface Section {
  id: SectionType;
  title: string;
  component: React.ReactNode;
}

export default function ContractBuilder() {
  const [contractData, setContractData] = useState<ContractFormData>({
    name: 'MyToken',
    tokenName: 'MyToken',
    tokenSymbol: 'MTK',
    initialSupply: 1000000,
    variables: [
      { name: 'totalSupply', type: 'uint256', visibility: 'public', defaultValue: '1000000' }
    ],
    functions: [
      { name: 'transfer', visibility: 'public', stateMutability: 'nonpayable', inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ], outputs: [], code: 'require(amount <= totalSupply); totalSupply -= amount;' }
    ],
    events: [
      { name: 'Transfer', parameters: [
        { name: 'from', type: 'address', indexed: true },
        { name: 'to', type: 'address', indexed: true },
        { name: 'amount', type: 'uint256', indexed: false }
      ] }
    ],
    inherits: ['ERC20'],
  });

  const [showDeployment, setShowDeployment] = useState(false);
  const [compiledContract, setCompiledContract] = useState<any>(null);
  const [network, setNetwork] = useState('sepolia');
  const [privateKey, setPrivateKey] = useState('');
  const [constructorArgs, setConstructorArgs] = useState('[]');
  const [deploymentResult, setDeploymentResult] = useState<any>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const updateContractData = (newData: Partial<ContractFormData>) => {
    setContractData(prev => ({ ...prev, ...newData }));
  };

  const sectionsList: Section[] = [
    {
      id: 'variable',
      title: 'State Variables',
      component: (
        <VariablesSection 
          variables={contractData.variables} 
          onUpdate={(variables: VariableDefinition[]) => updateContractData({ variables })}
          onAddFunction={(function_: FunctionDefinition) => updateContractData({ 
            functions: [...contractData.functions, function_] 
          })}
          onAddEvent={(event: EventDefinition) => updateContractData({ 
            events: [...contractData.events, event] 
          })}
        />
      )
    },
    {
      id: 'function',
      title: 'Functions',
      component: (
        <FunctionsSection 
          functions={contractData.functions} 
          variables={contractData.variables}
          onUpdate={(functions: FunctionDefinition[]) => updateContractData({ functions })} 
        />
      )
    },
    {
      id: 'event',
      title: 'Events',
      component: (
        <EventsSection 
          events={contractData.events} 
          onUpdate={(events: EventDefinition[]) => updateContractData({ events })} 
        />
      )
    }
  ];

  const handleCompileAndDeploy = async () => {
    try {
      console.log(contractData);
      const compilationResult = await compileContract(contractData);
      
      if (!compilationResult.success) {
        throw new Error(compilationResult.error);
      }

      const compiledContract = {
        name: contractData.name,
        abi: compilationResult.abi,
        bytecode: compilationResult.bytecode,
      };
      
      localStorage.setItem('compiledContract', JSON.stringify(compiledContract));
      setCompiledContract(compiledContract);
      setShowDeployment(true);
      
    } catch (error) {
      console.error('Compilation failed:', error);
      alert(`Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeploy = async () => {
    if (!compiledContract || !privateKey) return;
    
    setIsDeploying(true);
    try {
      const deploymentResult = await deployContract(compiledContract, network, privateKey, constructorArgs);
      setDeploymentResult(deploymentResult);
    } catch (error: unknown) {
      setDeploymentResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Header />
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Smart Contract Builder</h1>

      <div className="max-w-4xl">
        {!showDeployment ? (
          // Contract Builder UI
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contract Name</CardTitle>
              </CardHeader>
              <CardContent>
                <ContractNameSection 
                  contractData={contractData}
                  onUpdate={(data) => updateContractData(data)} 
                />
              </CardContent>
            </Card>

            <Accordion type="multiple" className="w-full">
              {sectionsList.map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="bg-muted/50 cursor-pointer px-4 py-3 rounded-t-lg font-medium">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent className="p-4 border border-t-0 border-border rounded-b-lg bg-card">
                    {section.component}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Button className="w-full md:w-auto cursor-pointer" onClick={handleCompileAndDeploy}>
              Generate & Compile Contract
            </Button>

            <ContractPreview contractData={contractData} />
          </div>
        ) : (
          // Deployment UI
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">Deploy Contract: {contractData.name}</h2>
              <Button variant="ghost" onClick={() => setShowDeployment(false)} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Editor
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="network">Network</Label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger id="network">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sepolia">Sepolia (Testnet)</SelectItem>
                      <SelectItem value="goerli">Goerli (Testnet)</SelectItem>
                      <SelectItem value="local">Local (Hardhat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privateKey">Private Key</Label>
                  <Input
                    id="privateKey"
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter your private key"
                  />
                  <p className="text-xs text-muted-foreground">
                    Never share your private key. This is stored locally and not sent to our servers.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constructorArgs">Constructor Arguments (JSON array)</Label>
                  <Textarea
                    id="constructorArgs"
                    className="font-mono h-32"
                    value={constructorArgs}
                    onChange={(e) => setConstructorArgs(e.target.value)}
                    placeholder="Enter constructor arguments as a JSON array"
                  />
                </div>

                <Button className="w-full" onClick={handleDeploy} disabled={isDeploying || !privateKey}>
                  {isDeploying ? "Deploying..." : "Deploy Contract"}
                </Button>

                {deploymentResult && (
                  <Alert variant={deploymentResult.success ? "default" : "destructive"}>
                    <AlertTitle>{deploymentResult.success ? "Deployment Successful" : "Deployment Failed"}</AlertTitle>
                    <AlertDescription>
                      {deploymentResult.success ? (
                        <div className="space-y-4 mt-2">
                          <div>
                            <p className="text-sm font-medium mb-1">Contract Address:</p>
                            <code className="block bg-muted p-2 rounded text-sm break-all">
                              {deploymentResult.contractAddress}
                            </code>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Transaction Hash:</p>
                            <code className="block bg-muted p-2 rounded text-sm break-all">
                              {deploymentResult.transactionHash}
                            </code>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">{deploymentResult.message}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}