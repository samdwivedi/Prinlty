import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminHash = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@printly.app" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@printly.app",
      passwordHash: adminHash,
      role: "ADMIN",
      isVerified: true,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Create operator user
  const operatorHash = await bcrypt.hash("Operator@123", 12);
  const operator = await prisma.user.upsert({
    where: { email: "operator@printly.app" },
    update: {},
    create: {
      name: "Print Shop Operator",
      email: "operator@printly.app",
      passwordHash: operatorHash,
      role: "OPERATOR",
      phone: "+91-9876543210",
      isVerified: true,
    },
  });
  console.log("✅ Operator created:", operator.email);

  // Create shop for operator
  const shop = await prisma.shop.upsert({
    where: { operatorId: operator.id },
    update: {},
    create: {
      name: "Campus Print Center",
      description: "Your one-stop print center for all academic printing needs",
      address: "Block A, Main Campus, University Road",
      phone: "+91-9876543210",
      email: "campus@printly.app",
      operatorId: operator.id,
    },
  });
  console.log("✅ Shop created:", shop.name);

  // Create printers
  const printers = await Promise.all([
    prisma.printer.upsert({
      where: { id: "printer-1" },
      update: {},
      create: {
        id: "printer-1",
        name: "HP LaserJet Pro",
        model: "HP LaserJet Pro MFP M428fdw",
        shopId: shop.id,
        status: "ONLINE",
        isColorCapable: false,
        isDuplexCapable: true,
      },
    }),
    prisma.printer.upsert({
      where: { id: "printer-2" },
      update: {},
      create: {
        id: "printer-2",
        name: "Canon Color Printer",
        model: "Canon PIXMA G6070",
        shopId: shop.id,
        status: "ONLINE",
        isColorCapable: true,
        isDuplexCapable: true,
      },
    }),
  ]);
  console.log("✅ Printers created:", printers.length);

  // Create student user
  const studentHash = await bcrypt.hash("Student@123", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@printly.app" },
    update: {},
    create: {
      name: "John Student",
      email: "student@printly.app",
      passwordHash: studentHash,
      role: "STUDENT",
      phone: "+91-9123456789",
      isVerified: true,
    },
  });
  console.log("✅ Student created:", student.email);

  console.log("\n🎉 Seeding complete!\n");
  console.log("Login credentials:");
  console.log("  Admin:    admin@printly.app / Admin@123");
  console.log("  Operator: operator@printly.app / Operator@123");
  console.log("  Student:  student@printly.app / Student@123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
