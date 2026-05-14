import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Users
  const hashedPassword = await bcrypt.hash("land", 10);

  await prisma.user.upsert({
    where: { username: "land" },
    update: {},
    create: {
      username: "land",
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { username: "view" },
    update: {},
    create: {
      username: "view",
      password: hashedPassword,
      name: "Viewer",
      role: "VIEWER",
    },
  });
  console.log("Default users seeded.");

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
