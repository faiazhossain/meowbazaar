import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@petbazaar.com" },
    update: {},
    create: {
      email: "admin@petbazaar.com",
      name: "Admin",
      password: adminPassword,
      phone: "+8801700000000",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create test customer
  const customerPassword = await bcrypt.hash("customer123", 10);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      name: "মোঃ আব্দুল্লাহ",
      password: customerPassword,
      phone: "+8801712345678",
      role: "CUSTOMER",
      cart: {
        create: {},
      },
    },
  });
  console.log("✅ Customer user created:", customer.email);

  console.log("🎉 Database seeded successfully!");
  console.log("");
  console.log("📧 Admin login: admin@petbazaar.com / admin123");
  console.log("📧 Customer login: customer@example.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
