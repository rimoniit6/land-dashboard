import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

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
