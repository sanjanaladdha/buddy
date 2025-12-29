# Database Migrations

This folder contains SQL migration files to set up your database schema.

## How to Run the Migration

### Option 1: Using Vercel Dashboard (Easiest)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to the **Storage** tab
4. Click on your Postgres database
5. Click on the **"Query"** tab
6. Copy and paste the contents of `001_create_tasks_table.sql`
7. Click **"Run"**

### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Link your project
vercel link

# Run the migration
vercel postgres execute <your-database-name> < migrations/001_create_tasks_table.sql
```

### Option 3: Using psql (if you have the connection string)

```bash
# Get your connection string from Vercel Dashboard > Storage > Postgres > .env.local
psql $DATABASE_URL -f migrations/001_create_tasks_table.sql
```

## What This Migration Does

Creates the `tasks` table with:

- `id` - Auto-incrementing primary key
- `title` - The task description
- `done` - Boolean flag (false by default)
- `check_in_hours` - Number of hours until check-in (supports decimals for minutes)
- `created_at` - Timestamp of when task was created

Also creates indexes for better query performance.

## Verifying It Worked

After running the migration, you can verify the table exists:

```sql
SELECT * FROM tasks;
```

This should return an empty result set (no rows yet), but no errors.
