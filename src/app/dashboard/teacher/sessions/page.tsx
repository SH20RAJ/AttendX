import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { CreateSessionForm } from "@/components/CreateSessionForm";
import { ArrowLeft } from "lucide-react";

export default async function SessionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    redirect("/dashboard");
  }

  const sessions = await prisma.session.findMany({
    where: { teacherId: session.user.id },
    include: { _count: { select: { attendance: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/teacher" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Sessions</h1>
          <p className="text-gray-600">{sessions.length} sessions total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No sessions yet. Create your first session!
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Subject</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Code</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Attendance</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/teacher/sessions/${s.id}`} className="font-medium text-blue-600 hover:underline">
                          {s.subject}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono">{s.code}</code>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(s.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-sm">{s._count.attendance}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {s.isActive ? "Active" : "Closed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Session</h2>
          <CreateSessionForm />
        </div>
      </div>
    </div>
  );
}
