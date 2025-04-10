// types/contracts.ts
export interface VariableDefinition {
    name: string;
    type: string;
    visibility: 'public' | 'private' | 'internal' | 'external';
    constant?: boolean;
    defaultValue?: string;
  }
  
  export interface FunctionInput {
    name: string;
    type: string;
  }
  
  export interface FunctionOutput {
    name?: string;
    type: string;
  }
  
  export interface FunctionDefinition {
    name: string;
    inputs: FunctionInput[];
    outputs: FunctionOutput[];
    visibility: 'public' | 'private' | 'internal' | 'external';
    stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
    code?: string;
  }
  
  export interface EventParameter {
    name: string;
    type: string;
    indexed: boolean;
  }
  
  export interface EventDefinition {
    name: string;
    parameters: EventParameter[];
  }
  
  export interface ContractFormData {
    name: string;
    inherits?: string[];
    variables: VariableDefinition[];
    functions: FunctionDefinition[];
    events: EventDefinition[];
    tokenName: string;
    tokenSymbol: string;
    initialSupply: number;
  }