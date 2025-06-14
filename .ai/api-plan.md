# REST API Plan

## 1. Resources
- **Questions**: Maps to `questions` table in PostgreSQL database
- **Authentication**: Handled by Supabase Auth with GitHub OAuth provider

## 2. Endpoints

### Questions Resource

#### Generate and Store Questions
- **Method**: `POST`
- **Path**: `/api/questions/generate`
- **Description**: Generates 5 interview questions from job posting content using OpenRouter API and stores them in database
- **Request Payload**:
```json
{
  "jobPosting": "string (100-10000 characters)"
}
```
- **Response Payload**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "string",
      "position": 1,
      "practiced": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "message": "5 questions generated successfully"
}
```
- **Success Codes**: 
  - `201 Created`: Questions generated and stored successfully
- **Error Codes**:
  - `400 Bad Request`: Invalid job posting length or format
  - `401 Unauthorized`: User not authenticated
  - `422 Unprocessable Entity`: OpenRouter API error or invalid content
  - `429 Too Many Requests`: Rate limit exceeded
  - `500 Internal Server Error`: OpenRouter API key missing or server error

#### List User Questions
- **Method**: `GET`
- **Path**: `/api/questions`
- **Description**: Retrieves all questions for the authenticated user
- **Query Parameters**:
  - `practiced`: `boolean` (optional) - Filter by practice status
  - `limit`: `number` (optional, default: 50, max: 100) - Number of results
  - `offset`: `number` (optional, default: 0) - Pagination offset
- **Response Payload**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "string",
      "position": 1,
      "practiced": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```
- **Success Codes**:
  - `200 OK`: Questions retrieved successfully
- **Error Codes**:
  - `401 Unauthorized`: User not authenticated
  - `500 Internal Server Error`: Database error

#### Update Question Practice Status
- **Method**: `PATCH`
- **Path**: `/api/questions/{id}`
- **Description**: Updates the practiced status of a specific question
- **Path Parameters**:
  - `id`: `uuid` - Question ID
- **Request Payload**:
```json
{
  "practiced": true
}
```
- **Response Payload**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "string",
    "position": 1,
    "practiced": true,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Question status updated successfully"
}
```
- **Success Codes**:
  - `200 OK`: Question updated successfully
- **Error Codes**:
  - `400 Bad Request`: Invalid request payload
  - `401 Unauthorized`: User not authenticated
  - `403 Forbidden`: User doesn't own this question
  - `404 Not Found`: Question not found
  - `500 Internal Server Error`: Database error

#### Get Single Question
- **Method**: `GET`
- **Path**: `/api/questions/{id}`
- **Description**: Retrieves a specific question by ID
- **Path Parameters**:
  - `id`: `uuid` - Question ID
- **Response Payload**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "string",
    "position": 1,
    "practiced": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```
- **Success Codes**:
  - `200 OK`: Question retrieved successfully
- **Error Codes**:
  - `401 Unauthorized`: User not authenticated
  - `403 Forbidden`: User doesn't own this question
  - `404 Not Found`: Question not found

### Health Check
- **Method**: `GET`
- **Path**: `/api/health`
- **Description**: API health check endpoint
- **Response Payload**:
```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2024-01-01T00:00:00Z"
}
```
- **Success Codes**:
  - `200 OK`: API is healthy

## 3. Authentication and Authorization

### Authentication Method
- **Provider**: Supabase Auth with GitHub OAuth
- **Implementation**: 
  - Client-side: `@supabase/auth-helpers-nextjs` for session management
  - Server-side: JWT token validation through Supabase middleware
  - All API routes require valid authentication except `/api/health`

### Authorization Rules
- **Row-Level Security (RLS)**: Enabled on `questions` table
- **Access Control**:
  - Users can only access their own questions (`user_id = auth.uid()`)
  - Questions are automatically associated with authenticated user on creation
  - No cross-user data access permitted

### Session Management
- **Token Storage**: HTTP-only cookies managed by Supabase
- **Token Refresh**: Automatic refresh handled by Supabase client
- **Logout**: Handled by Supabase Auth, invalidates session

## 4. Validation and Business Logic

### Input Validation
- **Job Posting Content**: 100-10,000 characters (validated in `/api/questions/generate`)
- **Question Content**: 20-300 characters (enforced by database constraints)
- **Position**: Integer between 1-5 (enforced by database constraints)
- **Practiced**: Boolean value only (enforced by TypeScript types)

### Business Logic Implementation

#### Question Generation Logic
1. **Language Detection**: Automatically detect job posting language
2. **AI Processing**: Send job posting via OpenRouter API with structured prompt
3. **Content Validation**: Ensure generated questions meet length requirements
4. **Batch Storage**: Store all 5 questions atomically with positions 1-5
5. **Error Handling**: Graceful fallback for AI API failures

#### Data Integrity Rules
- **Immutable Content**: Question content cannot be modified after creation
- **User Isolation**: Strict user-based data separation via RLS
- **Atomic Operations**: Question generation is all-or-nothing transaction
- **Position Uniqueness**: Questions maintain sequential positions 1-5 per generation batch

#### Error Handling Strategies
- **OpenRouter API Failures**: Return user-friendly error messages, don't store incomplete data
- **Rate Limiting**: Implement exponential backoff for API calls
- **Validation Errors**: Return specific field-level error messages
- **Database Constraints**: Map constraint violations to meaningful user messages

### Performance Considerations
- **Response Time Target**: Question generation < 15 seconds average
- **Pagination**: Default limit of 50 questions, maximum 100 per request
- **Caching**: No caching for personalized question data
- **Database Indexing**: Optimized queries using `user_id` index

### Security Measures
- **Input Sanitization**: All text inputs sanitized to prevent XSS
- **SQL Injection Prevention**: Parameterized queries through Supabase client
- **Rate Limiting**: Implement per-user rate limits for question generation
- **CORS Configuration**: Restricted to application domain only 