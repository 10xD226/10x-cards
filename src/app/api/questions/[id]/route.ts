import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ZodError } from 'zod'

import { 
  UpdateQuestionPracticeStatusSchema, 
  QuestionIdSchema 
} from '../../../../schemas/question'
import { questionService } from '../../../../lib/questions'
import type { 
  UpdateQuestionResponseDto, 
  GetQuestionResponseDto,
  ApiErrorResponse
} from '../../../../types'
import type { Database } from '../../../../db/database.types'

/**
 * GET /api/questions/[id]
 * 
 * Gets a single question by ID for the authenticated user.
 * 
 * @param request - Next.js request object
 * @param params - Route parameters with question ID
 * @returns JSON response with question data or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookies(),
    })

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Please log in to view questions.',
        } as ApiErrorResponse,
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 2. Validate route parameters
    const { id } = await params
    let validatedParams
    try {
      validatedParams = QuestionIdSchema.parse({ id })
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid question ID format',
        } as ApiErrorResponse,
        { status: 400 }
      )
    }

    // 3. Fetch question from database
    try {
      const question = await questionService.getById(validatedParams.id, userId)
      
      const response: GetQuestionResponseDto = {
        success: true,
        data: question,
        timestamp: new Date().toISOString(),
      }

      return NextResponse.json(response, { status: 200 })
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            message: 'Question not found or access denied',
          } as ApiErrorResponse,
          { status: 404 }
        )
      }
      
      console.error('Database query failed:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch question. Please try again.',
        } as ApiErrorResponse,
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Unexpected error in get question endpoint:', error)
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
 * PATCH /api/questions/[id]
 * 
 * Updates the practice status of a question for the authenticated user.
 * 
 * @param request - Next.js request object with update data
 * @param params - Route parameters with question ID
 * @returns JSON response with updated question or error
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookies(),
    })

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Please log in to update questions.',
        } as ApiErrorResponse,
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 2. Validate route parameters
    const { id } = await params
    let validatedParams
    try {
      validatedParams = QuestionIdSchema.parse({ id })
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid question ID format',
        } as ApiErrorResponse,
        { status: 400 }
      )
    }

    // 3. Parse and validate request body
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

    let validatedInput
    try {
      validatedInput = UpdateQuestionPracticeStatusSchema.parse(requestBody)
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

    // 4. Update question in database
    try {
      const updatedQuestion = await questionService.updatePracticeStatus(
        validatedParams.id,
        validatedInput.practiced,
        userId
      )

      const response: UpdateQuestionResponseDto = {
        success: true,
        data: updatedQuestion,
        message: `Question practice status updated to ${validatedInput.practiced ? 'practiced' : 'not practiced'}`,
        timestamp: new Date().toISOString(),
      }

      return NextResponse.json(response, { status: 200 })
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            message: 'Question not found or access denied',
          } as ApiErrorResponse,
          { status: 404 }
        )
      }
      
      console.error('Database update failed:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update question. Please try again.',
        } as ApiErrorResponse,
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Unexpected error in update question endpoint:', error)
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
 * DELETE /api/questions/[id]
 * 
 * Deletes a question for the authenticated user.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookies(),
    })

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Please log in to delete questions.',
        } as ApiErrorResponse,
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 2. Validate route parameters
    const { id } = await params
    let validatedParams
    try {
      validatedParams = QuestionIdSchema.parse({ id })
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid question ID format',
        } as ApiErrorResponse,
        { status: 400 }
      )
    }

    // 3. Delete question from database
    try {
      await questionService.delete(validatedParams.id, userId)

      return NextResponse.json(
        {
          success: true,
          message: 'Question deleted successfully',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      )
      
    } catch (error) {
      console.error('Database delete failed:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to delete question. Please try again.',
        } as ApiErrorResponse,
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Unexpected error in delete question endpoint:', error)
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
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed. Use GET to fetch question, PATCH to update, or DELETE to remove.',
    } as ApiErrorResponse,
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed. Use PATCH to update question practice status.',
    } as ApiErrorResponse,
    { status: 405 }
  )
} 