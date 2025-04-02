// app/api/compile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { compileContract } from '@/services/contractCompiler';
import { ContractFormData } from '@/types/contracts';

export async function POST(req: NextRequest) {
  try {
    const contractData: ContractFormData = await req.json();
    
    if (!contractData || !contractData.name) {
      return NextResponse.json(
        { error: 'Invalid contract data' },
        { status: 400 }
      );
    }
    
    const result = await compileContract(contractData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        artifacts: result.artifacts
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}