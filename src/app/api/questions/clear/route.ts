import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '../../../../db/database.types'

/**
 * DELETE /api/questions/clear
 * 
 * Usuwa wszystkie pytania użytkownika (endpoint testowy)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookies(),
    })

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Failed to clear questions:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to clear questions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'All questions cleared successfully' 
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Unexpected error' },
      { status: 500 }
    )
  }
} 