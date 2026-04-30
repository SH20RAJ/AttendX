import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AttendanceHistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") redirect("/dashboard");

  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: session.user.id },
    include: { session: { select: { subject: true, code: true, createdAt: true, teacher: { select: { name: true } } } } },
    orderBy: { markedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/student" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
          <p className="text-gray-600">{records.length} records total</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {records.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No attendance records yet.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Subject</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Teacher</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Time</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.session.subject}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.session.teacher.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{format(new Date(r.markedAt), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{format(new Date(r.markedAt), "h:mm a")}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "PRESENT" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
