import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { JoinSessionForm } from "@/components/JoinSessionForm";
import { CheckCircle2, Clock, BookOpen } from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    redirect("/dashboard/teacher");
  }

  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: session.user.id },
    include: { session: { select: { subject: true, createdAt: true, teacher: { select: { name: true } } } } },
    orderBy: { markedAt: "desc" },
    take: 5,
  });

  const totalAttendance = await prisma.attendanceRecord.count({ where: { studentId: session.user.id } });
  const presentCount = await prisma.attendanceRecord.count({ where: { studentId: session.user.id, status: "PRESENT" } });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session.user.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Classes", value: totalAttendance, icon: <BookOpen className="w-5 h-5" />, color: "blue" },
          { label: "On Time", value: presentCount, icon: <CheckCircle2 className="w-5 h-5" />, color: "green" },
          { label: "Late Entries", value: totalAttendance - presentCount, icon: <Clock className="w-5 h-5" />, color: "yellow" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center text-${stat.color}-600 mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Join Session */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mark Attendance</h2>
          <JoinSessionForm />
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h2>
          <div className="space-y-3">
            {records.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No attendance records yet.</p>
            ) : (
              records.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{r.session.subject}</p>
                    <p className="text-xs text-gray-500">{r.session.teacher.name} • {format(new Date(r.markedAt), "MMM d, h:mm a")}</p>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "PRESENT" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {r.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
