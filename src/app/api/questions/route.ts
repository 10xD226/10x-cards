import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ZodError } from 'zod'

import { ListQuestionsQuerySchema } from '../../../schemas/question'
import { questionService } from '../../../lib/questions'
import type { 
  ListQuestionsResponseDto, 
  ApiErrorResponse
} from '../../../types'
import type { Database } from '../../../db/database.types'

/**
 * GET /api/questions
 * 
 * Lists questions for the authenticated user with optional filtering and pagination.
 * Query parameters:
 * - practiced: boolean (optional) - filter by practice status
 * - limit: number (optional, default: 50, max: 100) - pagination limit
 * - offset: number (optional, default: 0) - pagination offset
 * 
 * @param request - Next.js request object with query parameters
 * @returns JSON response with questions list or error
 */
export async function GET(request: NextRequest) {
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
          message: 'Unauthorized. Please log in to view questions.',
        } as ApiErrorResponse,
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 2. Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      practiced: searchParams.get('practiced'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    }

    // Convert string parameters to appropriate types
    const rawQuery: Record<string, any> = {}
    if (queryParams.practiced !== null) {
      rawQuery.practiced = queryParams.practiced === 'true'
    }
    if (queryParams.limit !== null) {
      rawQuery.limit = queryParams.limit
    }
    if (queryParams.offset !== null) {
      rawQuery.offset = queryParams.offset
    }

    let validatedQuery
    try {
      validatedQuery = ListQuestionsQuerySchema.parse(rawQuery)
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid query parameters',
            errors: fieldErrors,
          } as ApiErrorResponse & { errors: typeof fieldErrors },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid query parameters',
        } as ApiErrorResponse,
        { status: 400 }
      )
    }

    // 3. Fetch questions from database
    let result
    try {
      result = await questionService.listByUser(userId, {
        practiced: validatedQuery.practiced,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
      })
    } catch (error) {
      console.error('Database query failed:', error)
      
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch questions. Please try again.',
        } as ApiErrorResponse,
        { status: 500 }
      )
    }

    // 4. Return success response
    const response: ListQuestionsResponseDto = {
      success: true,
      data: result.questions,
      pagination: {
        total: result.total,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in list questions endpoint:', error)
    
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
      message: 'Method not allowed. Use GET to list questions or POST /api/questions/generate to create new questions.',
    } as ApiErrorResponse,
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed. Use GET to list questions.',
    } as ApiErrorResponse,
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed. Use GET to list questions.',
    } as ApiErrorResponse,
    { status: 405 }
  )
} 