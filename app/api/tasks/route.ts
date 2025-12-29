import { NextResponse } from "next/server";
import { getTasks, createTask } from "@/lib/db";
import { inngest } from "@/lib/inngest";

export async function GET(){
    const tasks = await getTasks();
    return NextResponse.json(tasks);
}

export async function POST(request: Request){

    const body = await request.json();
    const { title, checkInHours } = body;

    const task = await createTask(title, checkInHours);

    await inngest.send({
        name: "task.created",
        data:{
            taskId: task.id,
            title: task.title,
            checkInHours: task.check_in_hours,
        }