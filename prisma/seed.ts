import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@meatpoint.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const hashed = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashed },
    create: { email: adminEmail, password: hashed, role: "ADMIN" },
  });

  const items = [
    {
      name: "Chicken Curry Cut (500g)",
      description: "Fresh cut chicken",
      priceCents: 24900,
    },
    {
      name: "Chicken Breast Boneless (500g)",
      description: "Boneless breast",
      priceCents: 29900,
    },
    {
      name: "Mutton Curry Cut (500g)",
      description: "Fresh mutton",
      priceCents: 54900,
    },
    {
      name: "Fish Rohu (500g)",
      description: "Fresh rohu fish",
      priceCents: 22900,
    },
  ];

  for (const it of items) {
    const existing = await prisma.item.findFirst({
      where: { name: it.name },
    });

    if (!existing) {
      await prisma.item.create({
        data: { ...it, isActive: true },
      });
    } else {
      await prisma.item.update({
        where: { id: existing.id },
        data: {
          description: it.description,
          priceCents: it.priceCents,
          isActive: true,
        },
      });
    }
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
