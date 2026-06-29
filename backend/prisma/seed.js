const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const existingHR = await prisma.user.findFirst({
    where: {
      role: "HR",
    },
  });

  if (existingHR) {
    console.log("✅ HR already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash("Hr@123456", 10);

  await prisma.user.create({
    data: {
      name: "HR Admin",
      email: "hr@company.com",
      password: hashedPassword,
      role: "HR",
      department: "Human Resources",
      designation: "HR Manager",
    },
  });

  console.log("✅ Default HR created successfully.");
  console.log("----------------------------------------");
  console.log("Login Credentials");
  console.log("Email    : hr@company.com");
  console.log("Password : Hr@123456");
  console.log("----------------------------------------");
}

main()
  .catch((error) => {
    console.error("❌ Seed Failed");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });