-- =====================================================================================
-- Migration: Create questions table
-- Purpose: Create the main questions table for interview preparation app
-- Affected Tables: questions (new table)
-- Dependencies: Requires auth.users table (provided by Supabase Auth)
-- =====================================================================================

-- Enable uuid extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create the questions table
-- This table stores interview questions for users with their practice status
create table public.questions (
    -- Primary key with UUID auto-generation
    id uuid primary key default uuid_generate_v4(),
    
    -- Foreign key to auth.users - each question belongs to a specific user
    user_id uuid not null references auth.users(id) on delete cascade,
    
    -- Question content with length constraints (20-300 characters as per requirements)
    content text not null check (char_length(content) >= 20 and char_length(content) <= 300),
    
    -- Position of question in user's list (1-5 as per requirements)
    position smallint not null check (position >= 1 and position <= 5),
    
    -- Track whether the question has been practiced
    practiced boolean not null default false,
    
    -- Timestamp for when the question was created
    created_at timestamptz not null default now()
);

-- =====================================================================================
-- INDEXES
-- =====================================================================================

-- Create index on user_id for efficient queries by user
-- This will speed up queries when fetching all questions for a specific user
create index idx_questions_user_id on public.questions(user_id);

-- Create composite index on user_id and position for ordering queries
-- This will optimize queries that fetch questions for a user in a specific order
create index idx_questions_user_position on public.questions(user_id, position);

-- =====================================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================================

-- Enable Row Level Security on the questions table
-- This ensures users can only access their own questions
alter table public.questions enable row level security;

-- =====================================================================================
-- RLS POLICIES FOR AUTHENTICATED USERS
-- =====================================================================================

-- Policy: Allow authenticated users to select their own questions
-- Rationale: Users should only be able to view questions they created
create policy "authenticated_users_select_own_questions" 
    on public.questions 
    for select 
    to authenticated 
    using (auth.uid() = user_id);

-- Policy: Allow authenticated users to insert questions for themselves
-- Rationale: Users should only be able to create questions for their own account
create policy "authenticated_users_insert_own_questions" 
    on public.questions 
    for insert 
    to authenticated 
    with check (auth.uid() = user_id);

-- Policy: Allow authenticated users to update their own questions
-- Rationale: Users should only be able to modify questions they created
-- Note: Based on requirements, only the 'practiced' flag should be updated after insertion
create policy "authenticated_users_update_own_questions" 
    on public.questions 
    for update 
    to authenticated 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- =====================================================================================
-- RLS POLICIES FOR ANONYMOUS USERS
-- =====================================================================================

-- Policy: Deny all access for anonymous users to select questions
-- Rationale: Questions are private and should only be accessible to authenticated users
create policy "anonymous_users_deny_select_questions" 
    on public.questions 
    for select 
    to anon 
    using (false);

-- Policy: Deny all access for anonymous users to insert questions
-- Rationale: Only authenticated users should be able to create questions
create policy "anonymous_users_deny_insert_questions" 
    on public.questions 
    for insert 
    to anon 
    with check (false);

-- Policy: Deny all access for anonymous users to update questions
-- Rationale: Only authenticated users should be able to modify questions
create policy "anonymous_users_deny_update_questions" 
    on public.questions 
    for update 
    to anon 
    using (false);

-- =====================================================================================
-- COMMENTS
-- =====================================================================================

-- Add table and column comments for documentation
comment on table public.questions is 'Stores interview questions for users with practice tracking';
comment on column public.questions.id is 'Primary key UUID for the question';
comment on column public.questions.user_id is 'Foreign key to auth.users - owner of the question';
comment on column public.questions.content is 'Question text content (20-300 characters)';
comment on column public.questions.position is 'Position in user question list (1-5)';
comment on column public.questions.practiced is 'Flag indicating if question has been practiced';
comment on column public.questions.created_at is 'Timestamp when question was created'; 