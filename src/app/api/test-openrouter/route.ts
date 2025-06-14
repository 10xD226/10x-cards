import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic import
    const { openRouterAdapter } = await import('../../../lib/openrouter-adapter');
    
    return NextResponse.json({ 
      status: 'OK',
      isDemoMode: openRouterAdapter.isInDemoMode,
      message: 'OpenRouter adapter imported successfully'
    });
    
  } catch (error) {
    console.error('Import failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to import OpenRouter adapter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { openRouterAdapter } = await import('../../../lib/openrouter-adapter');
    
    const { jobAd } = await req.json();
    
    if (!jobAd) {
      return NextResponse.json(
        { error: 'Missing jobAd' },
        { status: 400 }
      );
    }

    // Test question generation
    const questions = await openRouterAdapter.generateQuestions(jobAd);

    return NextResponse.json({ 
      success: true,
      questions,
      isDemoMode: openRouterAdapter.isInDemoMode
    });
    
  } catch (error) {
    console.error('Question generation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 