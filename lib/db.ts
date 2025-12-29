import { sql } from '@vercel/postgres';

// =============================================================================
// DATABASE HELPER FUNCTIONS
// =============================================================================
// These functions talk to your Postgres database. The `sql` template literal
// is magic - it automatically connects using your DATABASE_URL and protects
// against SQL injection attacks.
// =============================================================================

// Define what a Task looks like in TypeScript
// This helps catch errors - if you try to access task.tite (typo), TypeScript warns you!
export type Task = {
  id: number;
  title: string;
  done: boolean;
  check_in_hours: number;
  created_at: Date;
};

// -----------------------------------------------------------------------------
// GET ALL TASKS FROM TODAY
// -----------------------------------------------------------------------------
// We only show today's tasks to keep the app focused on "what do I need to do TODAY?"
// The SQL filters tasks where created_at is today (using PostgreSQL's DATE function)
export async function getTasks(): Promise<Task[]> {
  const result = await sql<Task>`
    SELECT * FROM tasks 
    WHERE DATE(created_at) = CURRENT_DATE 
    ORDER BY created_at DESC
  `;
  return result.rows;
}

// -----------------------------------------------------------------------------
// CREATE A NEW TASK
// -----------------------------------------------------------------------------
// When you add a task, we store:
// - title: what you want to accomplish
// - check_in_hours: how many hours until Inngest checks on you
// 
// The RETURNING * at the end gives us back the created task (including its new ID)
export async function createTask(title: string, checkInHours: number): Promise<Task> {
  const result = await sql<Task>`
    INSERT INTO tasks (title, check_in_hours) 
    VALUES (${title}, ${checkInHours})
    RETURNING *
  `;
  return result.rows[0];
}

// -----------------------------------------------------------------------------
// MARK A TASK AS DONE
// -----------------------------------------------------------------------------
// Flips the 'done' column to true. Once done, Inngest won't send you reminders!
export async function markTaskDone(id: number): Promise<Task | null> {
  const result = await sql<Task>`
    UPDATE tasks 
    SET done = true 
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0] || null;
}

// -----------------------------------------------------------------------------
// CHECK IF A TASK IS DONE
// -----------------------------------------------------------------------------
// Inngest calls this when checking up on you. If the task is done, no email sent!
export async function isTaskDone(id: number): Promise<boolean> {
  const result = await sql<Task>`
    SELECT done FROM tasks WHERE id = ${id}
  `;
  
  // If task doesn't exist or is done, return true (no need to remind)
  if (result.rows.length === 0) return true;
  return result.rows[0].done;
}

// -----------------------------------------------------------------------------
// GET A SINGLE TASK BY ID
// -----------------------------------------------------------------------------
// Used by Inngest to get the task title for the reminder email
export async function getTask(id: number): Promise<Task | null> {
  const result = await sql<Task>`
    SELECT * FROM tasks WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

