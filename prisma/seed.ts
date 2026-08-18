import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} users. Skipping seed.`);
    return;
  }

  const hashedAdmin = await bcrypt.hash("admin123", 10);
  const hashedMember = await bcrypt.hash("member123", 10);

  await prisma.user.createMany({
    data: [
      {
        fullName: "Pastor Daniel Moore",
        email: "admin@church.org",
        password: hashedAdmin,
        role: "system-admin",
        church: "Grace City Church",
        team: "Worship Team",
        ministryRole: "Pastor",
        availability: "Available",
        nextAssignment: "Sunday service",
      },
      {
        fullName: "Martha Wilson",
        email: "member@church.org",
        password: hashedMember,
        role: "user-admin",
        church: "Grace City Church",
        team: "Ushers",
        ministryRole: "Usher Lead",
        availability: "Available",
        nextAssignment: "Main entrance",
      },
    ],
  });

  console.log("Seed data inserted successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
