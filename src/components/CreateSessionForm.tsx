"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

export function CreateSessionForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("60");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, duration: parseInt(duration) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create session");
      setLoading(false);
    } else {
      router.push(`/dashboard/teacher/sessions/${data.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Class</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          placeholder="e.g., Mathematics - Chapter 5"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Session Duration</label>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">1 hour</option>
          <option value="90">1.5 hours</option>
          <option value="120">2 hours</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
      >
        <PlusCircle className="w-4 h-4" />
        {loading ? "Creating..." : "Create Session"}
      </button>
    </form>
  );
}
