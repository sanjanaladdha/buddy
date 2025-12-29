import { NextResponse } from "next/server";
import { markTaskDone } from "@/lib/db";

// PATCH /api/tasks/[id] - Mark a task as done
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Get the task ID from the URL (e.g., /api/tasks/123 -> id = "123")
    const { id } = await params;
    
    // Convert string to number and mark as done
    const task = await markTaskDone(Number(id));
    
    // Return the updated task
    return NextResponse.json(task);
}
