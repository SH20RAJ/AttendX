import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { code } = await req.json();
    const attendanceSession = await prisma.session.findUnique({
      where: { code: code.toUpperCase() },
      include: { teacher: { select: { name: true } } },
    });
    if (!attendanceSession) return NextResponse.json({ error: "Invalid code" }, { status: 404 });
    if (!attendanceSession.isActive) return NextResponse.json({ error: "Session is closed" }, { status: 400 });
    if (new Date() > attendanceSession.expiresAt) return NextResponse.json({ error: "Session expired" }, { status: 400 });

    return NextResponse.json(attendanceSession);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
