"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { CheckCircle, LogOut, LayoutDashboard, ClipboardList } from "lucide-react";

interface NavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export function DashboardNav({ user }: NavProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AttendX</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            {user.role === "TEACHER" || user.role === "ADMIN" ? (
              <>
                <Link href="/dashboard/teacher" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm font-medium">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href="/dashboard/teacher/sessions" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm font-medium">
                  <ClipboardList className="w-4 h-4" />
                  Sessions
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard/student" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm font-medium">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href="/dashboard/student/history" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm font-medium">
                  <ClipboardList className="w-4 h-4" />
                  History
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1 text-gray-500 hover:text-red-600 text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
