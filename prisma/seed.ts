import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";

// Use the direct database URL (not Accelerate URL)
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or POSTGRES_URL environment variable is required");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");
  
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@meatpoint.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const hashed = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashed },
    create: { email: adminEmail, password: hashed, role: "ADMIN" },
  });

  console.log("✅ Admin user seeded");

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
    await prisma.item.upsert({
      where: { name: it.name },
      update: {
        description: it.description,
        priceCents: it.priceCents,
        isActive: true,
      },
      create: { ...it, isActive: true },
    });
  }

  console.log("✅ Items seeded");
  console.log("🎉 Database seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });