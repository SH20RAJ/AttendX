import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SessionQRCode } from "@/components/SessionQRCode";
import { SessionControls } from "@/components/SessionControls";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    redirect("/dashboard");
  }

  const attendanceSession = await prisma.session.findUnique({
    where: { id },
    include: {
      teacher: { select: { name: true } },
      attendance: {
        include: { student: { select: { name: true, email: true, rollNumber: true } } },
        orderBy: { markedAt: "asc" },
      },
    },
  });

  if (!attendanceSession) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/teacher/sessions" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{attendanceSession.subject}</h1>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${attendanceSession.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {attendanceSession.isActive ? "Active" : "Closed"}
            </span>
          </div>
          <p className="text-gray-600">Code: <code className="bg-gray-100 px-2 py-0.5 rounded font-mono font-bold">{attendanceSession.code}</code></p>
        </div>
        <SessionControls sessionId={id} isActive={attendanceSession.isActive} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* QR Code */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Session QR Code</h2>
          <SessionQRCode code={attendanceSession.code} />
          <p className="mt-4 text-2xl font-bold font-mono text-blue-600">{attendanceSession.code}</p>
          <p className="text-sm text-gray-500 mt-1">Scan or enter this code</p>
          <div className="mt-4 text-sm text-gray-600">
            <p>Expires: {format(new Date(attendanceSession.expiresAt), "MMM d, h:mm a")}</p>
          </div>
        </div>

        {/* Attendance List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
            <span className="text-sm font-medium text-gray-600">{attendanceSession.attendance.length} present</span>
          </div>
          {attendanceSession.attendance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No students have marked attendance yet.</p>
              <p className="text-sm mt-1">Share the QR code or session code with students.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Roll No.</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Time</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendanceSession.attendance.map((record) => (
                    <tr key={record.id}>
                      <td className="px-4 py-2 text-sm font-medium">{record.student.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{record.student.rollNumber || "—"}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{format(new Date(record.markedAt), "h:mm a")}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${record.status === "PRESENT" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
