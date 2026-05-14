import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "admin@land.com" }
  });

  if (!user) {
    console.log("User not found!");
    return;
  }

  console.log("User found:", user.email);
  console.log("Has password:", !!user.password);

  if (user.password) {
    const isValid = await bcrypt.compare("land", user.password);
    console.log("Comparison of 'land' with stored hash:", isValid);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
