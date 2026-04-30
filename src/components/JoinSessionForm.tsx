"use client";
import { useState } from "react";
import { QrCode, ArrowRight, CheckCircle2 } from "lucide-react";

export function JoinSessionForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<{ session: { subject: string }; status: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const deviceId = localStorage.getItem("deviceId") || crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.toUpperCase(), deviceId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to mark attendance");
    } else {
      setSuccess(true);
      setResult(data);
      setCode("");
    }
    setLoading(false);
  }

  return (
    <div>
      {success && result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Attendance marked!</span>
          </div>
          <p className="text-sm text-green-600 mt-1">{result.session.subject} — {result.status}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Code</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg tracking-wider uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "..." : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </form>
      <p className="text-xs text-gray-500 mt-3">Enter the 6-character code shown by your teacher, or scan the QR code.</p>
    </div>
  );
}
