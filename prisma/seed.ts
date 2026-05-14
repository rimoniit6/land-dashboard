import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Users
  const hashedPassword = await bcrypt.hash("land", 10);

  // Use emails now for NextAuth Prisma Adapter standard
  await prisma.user.upsert({
    where: { email: "admin@land.com" },
    update: {},
    create: {
      email: "admin@land.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "view@land.com" },
    update: {},
    create: {
      email: "view@land.com",
      password: hashedPassword,
      name: "Viewer User",
      role: "VIEWER",
    },
  });
  console.log("Default users seeded (admin@land.com, view@land.com).");

  // Ensure CompanyAccount exists
  await prisma.companyAccount.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, balance: 0 },
  });
  console.log("CompanyAccount ensured.");

  // Ensure CompanySetting exists
  await prisma.companySetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: "LAND Group",
      rules: "",
      description: "",
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      mobileNumber: "",
    },
  });
  console.log("CompanySetting ensured.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
