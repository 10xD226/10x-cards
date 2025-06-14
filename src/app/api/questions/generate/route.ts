import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ZodError } from 'zod'

import { GenerateQuestionsSchema } from '../../../../schemas/question'
import { openRouterAdapter as aiService } from '../../../../lib/openrouter-adapter'
import { questionService } from '../../../../lib/questions'
import type { 
  GenerateQuestionsResponseDto, 
  ApiErrorResponse
} from '../../../../types'
import type { Database } from '../../../../db/database.types'

/**
 * POST /api/questions/generate
 * 
 * Generates exactly 5 interview questions based on job posting text.
 * Requires authentication via Supabase session.
 * 
 * @param request - Next.js request object with job posting in body
 * @returns JSON response with generated questions or error
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication - Create Supabase client and verify session
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookies(),
    })

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session?.user) {
      console.error('Authentication failed:', authError)
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Please log in to generate questions.',
        } as ApiErrorResponse,
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 2. Parse and validate request body
    let requestBody
    try {
      requestBody = await request.json()
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON in request body',
        } as ApiErrorResponse,
        { status: 400 }
      )
    }

    // 3. Validate input using Zod schema
    let validatedInput
    try {
      validatedInput = GenerateQuestionsSchema.parse(requestBody)
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        
        return NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: fieldErrors,
          } as ApiErrorResponse & { errors: typeof fieldErrors },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input data',
        } as ApiErrorResponse,
        { status: 400 }
      )
    }

    // 4. Generate questions using OpenRouter
    let generatedQuestions: string[]
    try {
      generatedQuestions = await aiService.generateQuestions(
        validatedInput.jobPosting
      )
    } catch (error) {
      console.error('OpenRouter generation failed:', error)
      
      if (error instanceof Error) {
        // Handle specific OpenRouter errors
        if (error.message.includes('Invalid OpenRouter API key')) {
          return NextResponse.json(
            {
              success: false,
              message: 'Service temporarily unavailable. Please try again later.',
            } as ApiErrorResponse,
            { status: 500 }
          )
        }
        
        if (error.message.includes('rate limit')) {
          return NextResponse.json(
            {
              success: false,
              message: 'Too many requests. Please try again in a few minutes.',
            } as ApiErrorResponse,
            { status: 429 }
          )
        }
        
        if (error.message.includes('quality requirements')) {
          return NextResponse.json(
            {
              success: false,
              message: 'Unable to generate quality questions for this job posting. Please try with a different posting.',
            } as ApiErrorResponse,
            { status: 422 }
          )
        }
      }
      
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to generate questions. Please try again.',
        } as ApiErrorResponse,
        { status: 500 }
      )
    }

    // 5. Save questions to database atomically
    let savedQuestions
    try {
      savedQuestions = await questionService.createBatch(generatedQuestions, userId)
    } catch (error) {
      console.error('Database save failed:', error)
      
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to save questions. Please try again.',
        } as ApiErrorResponse,
        { status: 500 }
      )
    }

    // 6. Return success response
    const response: GenerateQuestionsResponseDto = {
      success: true,
      data: savedQuestions,
      message: `Successfully generated and saved ${savedQuestions.length} questions`,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    // 7. Handle unexpected errors
    console.error('Unexpected error in generate questions endpoint:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      } as ApiErrorResponse,
      { status: 500 }
    )
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed. Use POST to generate questions.',
    } as ApiErrorResponse,
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed. Use POST to generate questions.',
    } as ApiErrorResponse,
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed. Use POST to generate questions.',
    } as ApiErrorResponse,
    { status: 405 }
  )
} 