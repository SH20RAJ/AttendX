import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const attendanceSession = await prisma.session.findUnique({
      where: { id },
      include: {
        teacher: { select: { name: true, email: true } },
        attendance: {
          include: { student: { select: { name: true, email: true, rollNumber: true } } },
          orderBy: { markedAt: "asc" },
        },
      },
    });
    if (!attendanceSession) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    return NextResponse.json(attendanceSession);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { isActive } = await req.json();
    const updated = await prisma.session.update({
      where: { id, teacherId: session.user.id },
      data: { isActive },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
