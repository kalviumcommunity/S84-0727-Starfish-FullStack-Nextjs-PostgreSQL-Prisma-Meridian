import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.update({
      where: { email: "krishangoyal717@gmail.com" },
      data: { role: "ADMIN" }
    });
    console.log("Updated user:", user.email, user.role);
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.log("User krishangoyal717@gmail.com not found. Create it in the app first.");
    } else {
      console.error(error);
    }
  }
}

main().finally(() => prisma.$disconnect());
