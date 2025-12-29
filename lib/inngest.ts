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
// Resend is initialized lazily (only when needed) to avoid build-time errors.
// The API key is only required at runtime when actually sending emails.
// =============================================================================

function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error("RESEND_API_KEY is not set in environment variables");
    }
    return new Resend(apiKey);
}

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
                    const resend = getResendClient();
                    await resend.emails.send({
                        from: "Accountability Buddy <onboarding@resend.dev>",
                        to: process.env.YOUR_EMAIL!,
                        subject: `Hey! Did you finish: ${title}?`,
                        html: `
                            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjFhYWMxZjQ0YWZiankxNDRoeXE3aGNna2hmZGFscHdraWdodjRmcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6ZtebNZofcKMWis0/giphy.gif" alt="Time's up!" style="width: 150px; height: auto; border-radius: 12px;" />
                                </div>
                                
                                <h1 style="color: #1f2937; font-size: 24px; font-weight: 600; text-align: center; margin-bottom: 8px;">
                                    Time to check in!
                                </h1>
                                
                                <p style="color: #6b7280; font-size: 16px; text-align: center; margin-bottom: 30px;">
                                    You wanted to accomplish:
                                </p>
                                
                                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                                    <p style="color: #1f2937; font-size: 18px; font-weight: 500; text-align: center; margin: 0;">
                                        ${title}
                                    </p>
                                </div>
                                
                                <p style="color: #6b7280; font-size: 16px; text-align: center; margin-bottom: 30px;">
                                    Did you finish it? Go mark it done! ✓
                                </p>
                                
                                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                                    — Your Accountability Buddy
                                </p>
                            </div>
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

