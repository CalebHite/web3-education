// app/api/compile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { compileContract } from '@/services/contractCompiler';
import { ContractFormData } from '@/types/contracts';
import solc from 'solc';

export async function POST(request: Request) {
  try {
    const { sourceCode, contractName } = await request.json();

    // Create input object for solc compiler
    const input = {
      language: 'Solidity',
      sources: {
        'contract.sol': {
          content: sourceCode
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*']
          }
        },
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    };

    // Compile the contract
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // Check for errors
    if (output.errors?.some((error: any) => error.severity === 'error')) {
      const errorMessage = output.errors
        .filter((error: any) => error.severity === 'error')
        .map((error: any) => error.message)
        .join('\n');
      
      return NextResponse.json({
        success: false,
        error: errorMessage
      });
    }

    // Extract compilation results
    const contract = output.contracts['contract.sol'][contractName];
    
    return NextResponse.json({
      success: true,
      abi: contract.abi,
      bytecode: contract.evm.bytecode.object
    });

  } catch (error) {
    console.error('Compilation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown compilation error'
    });
  }
}