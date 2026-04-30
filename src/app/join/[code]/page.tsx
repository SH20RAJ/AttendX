"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function JoinSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const code = params.code as string;
  const [state, setState] = useState<"loading" | "success" | "error" | "auth">("loading");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=/join/${code}`);
      return;
    }
    if (status === "authenticated" && session.user.role !== "STUDENT") {
      setState("error");
      setMessage("Only students can mark attendance via QR code.");
      return;
    }
    if (status === "authenticated") {
      markAttendance();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function markAttendance() {
    const deviceId = localStorage.getItem("deviceId") || crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, deviceId }),
    });
    const data = await res.json();
    if (res.ok) {
      setSubject(data.session.subject);
      setState("success");
    } else {
      setState("error");
      setMessage(data.error || "Failed to mark attendance");
    }
  }

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Marking attendance...</p>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full mx-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Marked!</h1>
          <p className="text-gray-600 mb-6">{subject}</p>
          <Link href="/dashboard/student" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block">
            View Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full mx-4">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Link href="/dashboard/student" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
