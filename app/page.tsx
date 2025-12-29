"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

// Time options
const TIME_OPTIONS = [
  { label: "2 min", value: 0.033, shortLabel: "2m" },
  { label: "1 hour", value: 1, shortLabel: "1h" },
  { label: "4 hours", value: 4, shortLabel: "4h" },
  { label: "12 hours", value: 12, shortLabel: "12h" },
  { label: "24 hours", value: 24, shortLabel: "24h" },
];

// Format hours to short label for the pill
function formatTimePill(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  return `${hours}h`;
}

type Task = {
  id: number;
  title: string;
  done: boolean;
  check_in_hours: number;
  created_at: string;
};

// Confetti celebration
function celebrate() {
  const defaults = {
    spread: 360,
    ticks: 70,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 20,
    colors: ["#374151", "#6b7280", "#9ca3af", "#d1d5db", "#1f2937"],
  };

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
    shapes: ["circle", "square"],
  });

  confetti({
    ...defaults,
    particleCount: 20,
    scalar: 0.75,
    shapes: ["circle"],
  });
}

// Format relative time
function getCheckInTime(createdAt: string, hours: number): string | null {
  const created = new Date(createdAt);
  const checkIn = new Date(created.getTime() + hours * 60 * 60 * 1000);
  const now = new Date();
  
  const diff = checkIn.getTime() - now.getTime();
  
  // If past due, don't show anything
  if (diff <= 0) {
    return null;
  }
  
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hoursLeft = Math.floor(minutes / 60);
  
  // Show seconds if less than 1 minute
  if (minutes < 1) {
    return `check-in in ${seconds}s`;
  }
  
  // Show minutes if less than 1 hour
  if (hoursLeft < 1) {
    return `check-in in ${minutes}m`;
  }
  
  // Show hours and minutes
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `check-in in ${hoursLeft}h`;
  }
  return `check-in in ${hoursLeft}h ${remainingMinutes}m`;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [selectedTime, setSelectedTime] = useState(4);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Force re-render every second for countdown
  const [, setTick] = useState(0);
  
  useEffect(() => {
    fetchTasks();
    // Refresh data every minute
    const dataInterval = setInterval(fetchTasks, 60000);
    // Update countdown display every second
    const tickInterval = setInterval(() => setTick(t => t + 1), 1000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(tickInterval);
    };
  }, []);

  // Create task
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
        setTitle("");
        await fetchTasks();
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark task done
  const handleToggleDone = async (taskId: number, currentDone: boolean) => {
    if (currentDone) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
      });

      if (response.ok) {
        celebrate();
        await fetchTasks();
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        const form = document.querySelector("form");
        form?.requestSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const pendingTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);

  return (
    <div className="min-h-screen bg-[#fafafa] py-16 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Accountability Buddy
          </h1>
          <p className="text-gray-500 text-sm">
            What will you accomplish today?
          </p>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleSubmit} className="mb-10 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-4">
              <input
                ref={inputRef}
                type="text"
                placeholder="Add a new task..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 text-gray-900 placeholder-gray-400 bg-transparent outline-none text-[15px]"
                required
              />
              <span className="text-xs text-gray-400 hidden sm:block">⌘↵</span>
            </div>
            
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Remind me in:</span>
                <div className="flex gap-1.5">
                  {TIME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedTime(option.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        selectedTime === option.value
                          ? "bg-gray-800 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {option.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding
                  </span>
                ) : (
                  "Add"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Tasks */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div>
              <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-1">
                In Progress
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                {pendingTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="task-item flex items-start gap-3 p-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => handleToggleDone(task.id, task.done)}
                      className="custom-checkbox mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 text-[15px] leading-snug">
                          {task.title}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
                          {formatTimePill(task.check_in_hours)}
                        </span>
                      </div>
                      {getCheckInTime(task.created_at, task.check_in_hours) && (
                        <p className="text-xs text-gray-400 mt-1">
                          {getCheckInTime(task.created_at, task.check_in_hours)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-1">
                Completed
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                {completedTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="task-item flex items-start gap-3 p-4 opacity-60"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => {}}
                      className="custom-checkbox mt-0.5"
                      disabled
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-500 text-[15px] leading-snug line-through">
                          {task.title}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-400">
                          {formatTimePill(task.check_in_hours)}
                        </span>
                      </div>
                      <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Done
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!initialLoading && tasks.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-gray-900 font-medium mb-1">
                No tasks yet
              </h3>
              <p className="text-gray-500 text-sm">
                Add your first task and we&apos;ll keep you accountable!
              </p>
            </div>
          )}

          {/* Loading State */}
          {initialLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded-md" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-12">
          Built with <span className="line-through">Ingest</span> <span className="line-through">Inggest</span> Inngest ♥
        </p>
      </div>
    </div>
  );
}
