import { z } from 'zod'

/**
 * Schema for validating job posting input for question generation
 * Requirements:
 * - jobPosting: string between 100-10000 characters after trimming
 * - Must be valid UTF-8 text
 */
export const GenerateQuestionsSchema = z.object({
  jobPosting: z
    .string()
    .trim()
    .min(100, 'Job posting must be at least 100 characters long')
    .max(10000, 'Job posting cannot exceed 10,000 characters')
    .regex(/^[\s\S]*$/, 'Job posting must contain valid text')
})

/**
 * Schema for validating OpenAI generated questions
 * Each question must be 20-300 characters
 */
export const GeneratedQuestionsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(20, 'Question must be at least 20 characters long')
      .max(300, 'Question cannot exceed 300 characters')
  )
  .length(5, 'Must generate exactly 5 questions')

/**
 * Schema for validating update question practice status
 */
export const UpdateQuestionPracticeStatusSchema = z.object({
  practiced: z.boolean()
})

/**
 * Schema for validating question ID parameter
 */
export const QuestionIdSchema = z.object({
  id: z.string().uuid('Invalid question ID format')
})

/**
 * Schema for validating list questions query parameters
 */
export const ListQuestionsQuerySchema = z.object({
  practiced: z.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
})

export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsSchema>
export type GeneratedQuestionsInput = z.infer<typeof GeneratedQuestionsSchema>
export type UpdateQuestionPracticeStatusInput = z.infer<typeof UpdateQuestionPracticeStatusSchema>
export type QuestionIdInput = z.infer<typeof QuestionIdSchema>
export type ListQuestionsQueryInput = z.infer<typeof ListQuestionsQuerySchema> 