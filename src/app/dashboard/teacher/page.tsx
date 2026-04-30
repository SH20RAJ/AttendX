import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreateSessionForm } from "@/components/CreateSessionForm";
import { Users, BookOpen, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    redirect("/dashboard/student");
  }

  const [sessions, totalAttendance] = await Promise.all([
    prisma.session.findMany({
      where: { teacherId: session.user.id },
      include: { _count: { select: { attendance: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.attendanceRecord.count({
      where: { session: { teacherId: session.user.id } },
    }),
  ]);

  const activeSessions = sessions.filter(s => s.isActive);
  const totalSessions = await prisma.session.count({ where: { teacherId: session.user.id } });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session.user.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Sessions", value: totalSessions, icon: <BookOpen className="w-5 h-5" />, color: "blue" },
          { label: "Active Sessions", value: activeSessions.length, icon: <Clock className="w-5 h-5" />, color: "green" },
          { label: "Total Attendance", value: totalAttendance, icon: <Users className="w-5 h-5" />, color: "purple" },
          { label: "Recent Sessions", value: sessions.length, icon: <TrendingUp className="w-5 h-5" />, color: "orange" },
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
        {/* Create Session */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Session</h2>
          <CreateSessionForm />
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
            <Link href="/dashboard/teacher/sessions" className="text-blue-600 text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No sessions yet. Create your first session!</p>
            ) : (
              sessions.map((s) => (
                <Link key={s.id} href={`/dashboard/teacher/sessions/${s.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">{s.subject}</p>
                      <p className="text-xs text-gray-500">{format(new Date(s.createdAt), "MMM d, yyyy h:mm a")}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {s.isActive ? "Active" : "Closed"}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">{s._count.attendance} present</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
