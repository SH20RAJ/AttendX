"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StopCircle, RefreshCw } from "lucide-react";

interface Props {
  sessionId: string;
  isActive: boolean;
}

export function SessionControls({ sessionId, isActive }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleSession() {
    setLoading(true);
    await fetch(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => router.refresh()}
        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <RefreshCw className="w-3 h-3" />
        Refresh
      </button>
      {isActive && (
        <button
          onClick={toggleSession}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          <StopCircle className="w-3 h-3" />
          {loading ? "Closing..." : "End Session"}
        </button>
      )}
    </div>
  );
}
