# Setup Guide: Accountability Buddy

This guide walks you through setting up the app from scratch, step by step.

## Prerequisites

- Node.js installed (v20 or later)
- A GitHub account (for deploying to Vercel)
- A Resend account (free tier is fine)

---

## Step 1: Set Up Vercel Postgres Database

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Storage"** → **"Postgres"**
3. Give it a name (e.g., "accountability-buddy-db")
4. Select a region close to you
5. Click **"Create"**
6. Once created, go to the **".env.local"** tab
7. Copy the `POSTGRES_URL` value (looks like `postgres://...`)

### Run the Migration

1. In the Vercel dashboard, go to your Postgres database
2. Click the **"Query"** tab
3. Open `migrations/001_create_tasks_table.sql` from this project
4. Copy the entire contents and paste into the Query editor
5. Click **"Run"**
6. You should see "Success" - the table is created!

---

## Step 2: Set Up Resend (Email Service)

1. Go to [resend.com](https://resend.com) and sign up (free)
2. Once logged in, go to **"API Keys"** in the sidebar
3. Click **"Create API Key"**
4. Name it "accountability-buddy"
5. Copy the API key (starts with `re_...`)

---

## Step 3: Configure Environment Variables

1. In your project root, open `.env.local`
2. Fill in the values:

```bash
POSTGRES_URL=postgres://...  # From Step 1
RESEND_API_KEY=re_...         # From Step 2
YOUR_EMAIL=your@email.com     # Where you want reminders sent
```

**Note:** Leave `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` empty for now - we'll add those during deployment.

---

## Step 4: Install Dependencies & Test Locally

```bash
# Make sure you're in the project directory
cd accountability-buddy

# Install dependencies (if you haven't already)
npm install

# Start the Next.js dev server
npm run dev
```

Your app should now be running at `http://localhost:3000`!

### Test the App

1. Open `http://localhost:3000`
2. Add a test task with "2 min" check-in time
3. You should see it appear in the list
4. Wait 2 minutes - you should receive an email reminder!

---

## Step 5: Set Up Inngest Dev Server (For Local Testing)

Inngest has a dev server that lets you test workflows locally.

1. Install the Inngest CLI:
   ```bash
   npm install -g inngest-cli
   ```

2. In a **new terminal**, start the Inngest dev server:
   ```bash
   inngest dev
   ```

3. This will:
   - Start a local Inngest server
   - Open a dashboard at `http://localhost:8288`
   - Show you all your functions and events in real-time!

4. Keep both terminals running:
   - Terminal 1: `npm run dev` (Next.js)
   - Terminal 2: `inngest dev` (Inngest)

### Testing with Inngest Dev Server

1. Add a task with "2 min" check-in
2. Watch the Inngest dashboard - you'll see:
   - The `task.created` event appear
   - Your `check-in-on-task` function start
   - The sleep timer counting down
   - The function checking the database
   - The email being sent (if task not done)

This is **super helpful** for learning how Inngest works!

---

## Step 6: Deploy to Vercel

### 6.1: Push to GitHub

1. Initialize git (if you haven't):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub
3. Push your code:
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### 6.2: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js
4. Click **"Deploy"**

### 6.3: Add Environment Variables in Vercel

1. After deployment, go to your project settings
2. Click **"Environment Variables"**
3. Add these (same values from `.env.local`):
   - `POSTGRES_URL`
   - `RESEND_API_KEY`
   - `YOUR_EMAIL`

4. **Important:** Make sure to select all environments (Production, Preview, Development)
5. Click **"Save"**
6. Redeploy your app (Vercel will do this automatically)

---

## Step 7: Set Up Inngest Cloud

### 7.1: Create Inngest Account

1. Go to [app.inngest.com](https://app.inngest.com)
2. Sign up (free tier is fine)
3. Create a new app called "accountability-buddy"

### 7.2: Connect Your Vercel Deployment

1. In Inngest dashboard, go to **"Apps"**
2. Click **"Add App"** or select your app
3. Choose **"Vercel"** as the platform
4. Inngest will guide you through:
   - Installing the Inngest Vercel integration
   - Connecting your Vercel project
   - Setting up the webhook

### 7.3: Get Your Inngest Keys

1. In Inngest dashboard, go to **"Settings"** → **"Keys"**
2. Copy:
   - `Signing Key` → This is your `INNGEST_SIGNING_KEY`
   - `Event Key` → This is your `INNGEST_EVENT_KEY`

### 7.4: Add Inngest Keys to Vercel

1. Go back to Vercel project settings
2. Add environment variables:
   - `INNGEST_SIGNING_KEY` = (from Inngest dashboard)
   - `INNGEST_EVENT_KEY` = (from Inngest dashboard)
3. Redeploy

### 7.5: Verify It Works

1. Visit your deployed app
2. Add a test task
3. Go to Inngest dashboard → **"Functions"**
4. You should see your `check-in-on-task` function!
5. Click on it to see the workflow in action

---

## Troubleshooting

### Database Connection Issues

- Make sure `POSTGRES_URL` is set correctly in Vercel
- Verify the migration ran successfully (check Vercel Postgres Query tab)

### Emails Not Sending

- Check Resend dashboard for API key status
- Verify `YOUR_EMAIL` is set correctly
- Check Resend logs for any errors

### Inngest Functions Not Running

- Make sure `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` are set in Vercel
- Check Inngest dashboard for function registration
- Verify the `/api/inngest` endpoint is accessible

### Local Testing Issues

- Make sure both `npm run dev` and `inngest dev` are running
- Check that your `.env.local` has all required variables
- Look at the Inngest dev server dashboard for errors

---

## Next Steps

Once everything is working:

1. **Customize the email template** in `lib/inngest.ts`
2. **Add more features** (edit tasks, delete tasks, etc.)
3. **Style it more** (add your own design touches)
4. **Learn more Inngest** - try adding more functions!

---

## You Did It! 🎉

You've built a full-stack app with:
- ✅ Next.js frontend
- ✅ Postgres database
- ✅ Inngest workflows (the cool part!)
- ✅ Email notifications
- ✅ Deployed to production

This is a real, working app that you can use every day!

