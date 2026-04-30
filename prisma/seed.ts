import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const libsql = createClient({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.attendanceRecord.deleteMany();
  await prisma.session.deleteMany();
  await prisma.device.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  const teacher = await prisma.user.create({
    data: {
      name: "Dr. Smith",
      email: "teacher@attendx.com",
      password: hashedPassword,
      role: "TEACHER",
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@attendx.com",
      password: hashedPassword,
      role: "STUDENT",
      rollNumber: "CS001",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@attendx.com",
      password: hashedPassword,
      role: "STUDENT",
      rollNumber: "CS002",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@attendx.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Seed data created:");
  console.log("Teacher:", teacher.email);
  console.log("Students:", student1.email, student2.email);
  console.log("Admin:", admin.email);
  console.log("All passwords: password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
