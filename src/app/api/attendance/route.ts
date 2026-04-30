import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can mark attendance" }, { status: 401 });
  }

  try {
    const { code, deviceId } = await req.json();
    if (!code) return NextResponse.json({ error: "Session code is required" }, { status: 400 });

    const attendanceSession = await prisma.session.findUnique({ where: { code: code.toUpperCase() } });
    if (!attendanceSession) return NextResponse.json({ error: "Invalid session code" }, { status: 404 });
    if (!attendanceSession.isActive) return NextResponse.json({ error: "Session is not active" }, { status: 400 });
    if (new Date() > attendanceSession.expiresAt) {
      await prisma.session.update({ where: { id: attendanceSession.id }, data: { isActive: false } });
      return NextResponse.json({ error: "Session has expired" }, { status: 400 });
    }

    const existing = await prisma.attendanceRecord.findUnique({
      where: { sessionId_studentId: { sessionId: attendanceSession.id, studentId: session.user.id } },
    });
    if (existing) return NextResponse.json({ error: "Attendance already marked" }, { status: 400 });

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    const sessionAge = Date.now() - new Date(attendanceSession.createdAt).getTime();
    const status = sessionAge > 15 * 60 * 1000 ? "LATE" : "PRESENT";

    const record = await prisma.attendanceRecord.create({
      data: {
        sessionId: attendanceSession.id,
        studentId: session.user.id,
        deviceId: deviceId || null,
        ipAddress,
        status,
      },
      include: {
        session: { select: { subject: true, code: true } },
        student: { select: { name: true, email: true, rollNumber: true } },
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: session.user.id },
      include: { session: { select: { subject: true, code: true, createdAt: true, teacher: { select: { name: true } } } } },
      orderBy: { markedAt: "desc" },
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
