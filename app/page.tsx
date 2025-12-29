"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// Time options in hours (2 minutes = 2/60 = 0.033 hours, but we'll store as minutes for clarity)
const TIME_OPTIONS = [
  { label: "2 min", value: 0.033 }, // For testing
  { label: "1 hour", value: 1 },
  { label: "4 hours", value: 4 },
  { label: "12 hours", value: 12 },
  { label: "24 hours", value: 24 },
];

type Task = {
  id: number;
  title: string;
  done: boolean;
  check_in_hours: number;
  created_at: string;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [selectedTime, setSelectedTime] = useState(4); // Default: 4 hours
  const [loading, setLoading] = useState(false);

  // Fetch tasks on mount and after mutations
  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Create a new task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          checkInHours: selectedTime,
        }),
      });

      if (response.ok) {
        setTitle(""); // Clear form
        await fetchTasks(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark task as done
  const handleToggleDone = async (taskId: number, currentDone: boolean) => {
    if (currentDone) return; // Don't allow unchecking

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
      });

      if (response.ok) {
        await fetchTasks(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  // Format check-in time for display
  const formatCheckInTime = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min`;
    }
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            Accountability Buddy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set your goals. We&apos;ll check in on you.
          </p>
        </div>

        {/* Add Task Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add a New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  What do you want to accomplish?
                </label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Finish design mockups"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check in after:
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={selectedTime === option.value ? "default" : "outline"}
                      onClick={() => setSelectedTime(option.value)}
                      className="flex-1 min-w-[100px]"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding..." : "Add Task"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No tasks yet. Add one above to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border ${
                      task.done
                        ? "bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60"
                        : "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <Checkbox
                      checked={task.done}
                      onChange={() => handleToggleDone(task.id, task.done)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          task.done
                            ? "line-through text-gray-500 dark:text-gray-400"
                            : "text-gray-900 dark:text-gray-50"
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Check-in: {formatCheckInTime(task.check_in_hours)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
