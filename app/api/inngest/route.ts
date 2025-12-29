import { serve } from "inngest/next";
import { inngest, functions } from "@/lib/inngest";

// =============================================================================
// INNGEST API ROUTE
// =============================================================================
// This is the webhook endpoint that Inngest uses to communicate with your app.
// 
// HOW IT WORKS:
// 1. When you send an event (like "task.created"), it goes to Inngest's servers
// 2. Inngest figures out which functions should run based on that event
// 3. Inngest calls THIS endpoint to execute your function code
// 4. Your function runs, and Inngest tracks the result
//
// The serve() function from inngest/next handles all the HTTP stuff:
// - POST requests to run functions
// - GET requests for the Inngest dev server to discover your functions
// =============================================================================

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});

// =============================================================================
// THAT'S IT!
// =============================================================================
// This tiny file is all you need. The serve() function:
// - Registers your functions with Inngest
// - Handles incoming requests from Inngest's servers
// - Returns the right responses
//
// In development, visit http://localhost:3000/api/inngest to see your functions.
// The Inngest dev server will auto-discover them!
// =============================================================================

