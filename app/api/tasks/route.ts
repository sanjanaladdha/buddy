import { NextResponse } from "next/server";
import { getTasks, createTask } from "@/lib/db";
import { inngest } from "@/lib/inngest";

// GET /api/tasks - Fetch today's tasks
export async function GET() {
    const tasks = await getTasks();
    return NextResponse.json(tasks);
}

// POST /api/tasks - Create a new task and schedule check-in
export async function POST(request: Request) {
    // 1. Get the data from the request body
    const body = await request.json();
    const { title, checkInHours } = body;

    // 2. Save the task to the database
    const task = await createTask(title, checkInHours);

    // 3. Send event to Inngest - THIS TRIGGERS YOUR FUNCTION!
    await inngest.send({
        name: "task.created",
        data: {
            taskId: task.id,
            title: task.title,
            checkInHours: task.check_in_hours,
        },
    });

    // 4. Return the created task
    return NextResponse.json(task);
}
