import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  const { jobAd } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'Missing OPENAI_API_KEY' },
      { status: 500 }
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that generates concise interview questions.'
      },
      {
        role: 'user',
        content: `Generate exactly 5 interview questions based on this job ad:\n\n${jobAd}`
      }
    ],
    temperature: 0.7
  });

  const raw = completion.choices[0].message?.content ?? '';
  const questions = raw
    .split('\n')
    .map(q =>
      q
        // remove leading numbering like "1.", "2)" or "- "
        .replace(/^\s*\d+[).\-]?\s*/, '')
        .trim()
    )
    .filter(Boolean)
    .slice(0, 5);

  return NextResponse.json({ questions });
}
