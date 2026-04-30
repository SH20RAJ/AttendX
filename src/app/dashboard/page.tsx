import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  if (session.user.role === "TEACHER" || session.user.role === "ADMIN") {
    redirect("/dashboard/teacher");
  } else {
    redirect("/dashboard/student");
  }
}
