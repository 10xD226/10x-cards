import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '../db/database.types'
import type { QuestionDto, QuestionRow } from '../types'

/**
 * Question service for database operations
 * Handles CRUD operations for interview questions with proper RLS
 */
class QuestionService {
  /**
   * Creates a Supabase client for server-side operations
   * Uses cookies for authentication context
   */
  private createClient() {
    const cookieStore = cookies()
    return createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    })
  }

  /**
   * Creates a batch of questions atomically
   * @param questions - Array of question texts
   * @param userId - User ID from authenticated session
   * @returns Array of created question DTOs
   * @throws Error if batch creation fails
   */
  async createBatch(questions: string[], userId: string): Promise<QuestionDto[]> {
    const supabase = this.createClient()
    
    try {
      // Prepare question records with position indexing
      const questionRecords = questions.map((content, index) => ({
        content: content.trim(),
        user_id: userId,
        position: index + 1,
        practiced: false,
      }))

      // Insert all questions in a single transaction
      const { data, error } = await supabase
        .from('questions')
        .insert(questionRecords)
        .select('*')

      if (error) {
        console.error('Failed to create questions batch:', error)
        throw new Error(`Failed to save questions: ${error.message}`)
      }

      if (!data || data.length !== questions.length) {
        throw new Error('Batch creation returned unexpected number of records')
      }

      // Convert to DTOs (remove user_id for API response)
      return data.map(this.rowToDto)
      
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Unexpected error during question batch creation')
    }
  }

  /**
   * Lists questions for the authenticated user
   * @param userId - User ID from authenticated session
   * @param options - Query options (practiced filter, pagination)
   * @returns Object with questions array and pagination info
   */
  async listByUser(
    userId: string,
    options: {
      practiced?: boolean
      limit?: number
      offset?: number
    } = {}
  ): Promise<{ questions: QuestionDto[]; total: number }> {
    const supabase = this.createClient()
    const { practiced, limit = 50, offset = 0 } = options

    try {
      let query = supabase
        .from('questions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Apply practiced filter if specified
      if (typeof practiced === 'boolean') {
        query = query.eq('practiced', practiced)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list questions:', error)
        throw new Error(`Failed to fetch questions: ${error.message}`)
      }

      return {
        questions: (data || []).map(this.rowToDto),
        total: count || 0,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Unexpected error while fetching questions')
    }
  }

  /**
   * Updates the practiced status of a question
   * @param questionId - Question UUID
   * @param practiced - New practiced status
   * @param userId - User ID for authorization
   * @returns Updated question DTO
   */
  async updatePracticeStatus(
    questionId: string,
    practiced: boolean,
    userId: string
  ): Promise<QuestionDto> {
    const supabase = this.createClient()

    try {
      const { data, error } = await supabase
        .from('questions')
        .update({
          practiced,
          updated_at: new Date().toISOString(),
        })
        .eq('id', questionId)
        .eq('user_id', userId) // Ensure user can only update their own questions
        .select('*')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Question not found or access denied')
        }
        console.error('Failed to update question:', error)
        throw new Error(`Failed to update question: ${error.message}`)
      }

      return this.rowToDto(data)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Unexpected error while updating question')
    }
  }

  /**
   * Gets a single question by ID
   * @param questionId - Question UUID
   * @param userId - User ID for authorization
   * @returns Question DTO
   */
  async getById(questionId: string, userId: string): Promise<QuestionDto> {
    const supabase = this.createClient()

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Question not found or access denied')
        }
        console.error('Failed to get question:', error)
        throw new Error(`Failed to fetch question: ${error.message}`)
      }

      return this.rowToDto(data)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Unexpected error while fetching question')
    }
  }

  /**
   * Deletes a question
   * @param questionId - Question UUID
   * @param userId - User ID for authorization
   */
  async delete(questionId: string, userId: string): Promise<void> {
    const supabase = this.createClient()

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to delete question:', error)
        throw new Error(`Failed to delete question: ${error.message}`)
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Unexpected error while deleting question')
    }
  }

  /**
   * Converts database row to DTO (removes sensitive fields)
   * @param row - Database row
   * @returns Question DTO
   */
  private rowToDto(row: QuestionRow): QuestionDto {
    const { user_id, ...dto } = row
    return dto
  }
}

// Export singleton instance
export const questionService = new QuestionService() 