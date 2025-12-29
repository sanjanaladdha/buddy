-- =============================================================================
-- DATABASE MIGRATION: Create Tasks Table
-- =============================================================================
-- This creates the tasks table for the Accountability Buddy app.
-- Run this in your Vercel Postgres database when setting up the project.
-- =============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  check_in_hours NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- INDEXES (for better query performance)
-- =============================================================================
-- Index on created_at helps the "get today's tasks" query run faster
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Index on done status helps filter completed tasks quickly
CREATE INDEX IF NOT EXISTS idx_tasks_done ON tasks(done);

