import { NextRequest, NextResponse } from 'next/server';
import { openRouterAdapter as aiService } from '../../../lib/openrouter-adapter';

export async function POST(req: NextRequest) {
  try {
    const { jobAd } = await req.json();

    if (!jobAd || typeof jobAd !== 'string') {
      return NextResponse.json(
        { error: 'Invalid job ad content' },
        { status: 400 }
      );
    }

    // Use OpenRouter adapter to generate questions
    const questions = await aiService.generateQuestions(jobAd);

    return NextResponse.json({ questions });
    
  } catch (error) {
    console.error('Question generation failed:', error);
    
    if (error instanceof Error) {
      // Handle specific errors
      if (error.message.includes('Invalid OpenRouter API key')) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
