import { Inngest } from "inngest";
import { Resend } from "resend";
import { isTaskDone } from "./db";

// =============================================================================
// INNGEST CLIENT
// =============================================================================
// This creates your Inngest client - think of it as your app's identity.
// The 'id' is how Inngest knows which app these functions belong to.
// =============================================================================

export const inngest = new Inngest({ 
  id: "buddy" 
});

// =============================================================================
// RESEND CLIENT (for sending emails)
// =============================================================================
// Resend is initialized with your API key from environment variables.
// We'll use this inside our Inngest function to send reminder emails.
// =============================================================================

const resend = new Resend(process.env.RESEND_API_KEY);

const checkInFunction = inngest.createFunction(
    { id: "check-in",
    name: "task.check-in"},
    { event: "task.created"},
    async ({ event, step }) => {
        const{ taskId, title, checkInHours} = event.data;
        
        // Convert hours to duration string for step.sleep()
        // If less than 1 hour, use minutes (e.g., "2m"), otherwise use hours (e.g., "4h")
        const duration = checkInHours < 1 
            ? `${Math.round(checkInHours * 60)}m` 
            : `${checkInHours}h`;
        
        await step.sleep("wait-for-check-in", duration);
        const taskIsDone = await step.run("check-task-status", async() => {
            return await isTaskDone(taskId)})

            if (!taskIsDone) {
                await step.run("send-reminder-email", async () => {
                    await resend.emails.send({
                        from: "Accountability Buddy <onboarding@resend.dev>",
                        to: process.env.YOUR_EMAIL!,
                        subject: `Hey! Did you finish: ${title}?`,
                        html: `
                            <h2>Time to check in!</h2>
                            <p>You wanted to accomplish:</p>
                            <p><strong>${title}</strong></p>
                            <p>Did you finish it?</p>
                        `,
                    });
                });
            }
        }
);

// =============================================================================
// EXPORT ALL FUNCTIONS
// =============================================================================
// Inngest needs to know about all your functions. We export them as an array
// so the API route can register them all at once.
// =============================================================================

export const functions = [checkInFunction];

