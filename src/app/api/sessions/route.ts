import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { subject, duration } = await req.json();
    if (!subject) return NextResponse.json({ error: "Subject is required" }, { status: 400 });

    const minutes = duration || 60;
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.session.findUnique({ where: { code } });
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    const newSession = await prisma.session.create({
      data: { code, subject, teacherId: session.user.id, expiresAt },
      include: { teacher: { select: { name: true, email: true } }, _count: { select: { attendance: true } } },
    });
    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");

    const where: Record<string, unknown> = {};
    if (session.user.role === "TEACHER") where.teacherId = session.user.id;
    if (active === "true") where.isActive = true;

    const sessions = await prisma.session.findMany({
      where,
      include: {
        teacher: { select: { name: true, email: true } },
        _count: { select: { attendance: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
