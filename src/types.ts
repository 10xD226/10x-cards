import type { Tables } from './db/database.types'

// Base row type generated from Supabase schema for strong coupling with DB
// Any change in the "questions" table will propagate to QuestionDto via TypeScript.
export type QuestionRow = Tables<'questions'>

// Question Data Transfer Object exposed via API – we hide internal field `user_id`.
export type QuestionDto = Omit<QuestionRow, 'user_id'>

// Generic API response helpers -------------------------------------------------

/**
 * Generic pagination metadata returned by list endpoints.
 */
export interface PaginationDto {
  total: number
  limit: number
  offset: number
}

/**
 * Generic "success" envelope used by the API. The generic parameter `T` represents
 * the actual payload (single object, array, etc.).  Optional fields are present
 * only when relevant to the specific endpoint.
 */
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
  pagination?: PaginationDto
  timestamp?: string
}

/**
 * Generic error response envelope used by the API.
 */
export interface ApiErrorResponse {
  success: false
  message: string
}

// ------------------------------ Commands -------------------------------------

/**
 * Command model for POST /api/questions/generate
 */
export interface GenerateQuestionsCommand {
  /** Raw job posting text (100–10 000 characters) */
  jobPosting: string
}

/**
 * Path parameters for PATCH /api/questions/{id}
 */
export interface UpdateQuestionPathParams {
  /** Question identifier (UUID) */
  id: string
}

/**
 * Request body for PATCH /api/questions/{id}
 */
export interface UpdateQuestionPracticeStatusCommand {
  /** Desired practiced status */
  practiced: boolean
}

// ----------------------------- Query Params ----------------------------------

/**
 * Query parameters accepted by GET /api/questions endpoint.
 */
export interface ListQuestionsQuery {
  practiced?: boolean
  /** Number of results (default: 50, max: 100) */
  limit?: number
  /** Pagination offset */
  offset?: number
}

// ----------------------------- Response DTOs ---------------------------------

export type GenerateQuestionsResponseDto = ApiSuccessResponse<QuestionDto[]> & {
  message: string
}

export type ListQuestionsResponseDto = ApiSuccessResponse<QuestionDto[]> & {
  pagination: PaginationDto
}

export type UpdateQuestionResponseDto = ApiSuccessResponse<QuestionDto> & {
  message: string
}

export type GetQuestionResponseDto = ApiSuccessResponse<QuestionDto>

export interface HealthCheckResponseDto {
  success: true
  message: string
  timestamp: string
} 