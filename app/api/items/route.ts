import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { getServerSession } from "next-auth";

export async function GET() {
  const items = await prisma.item.findMany({
    where: { isActive: true },
    select: { id: true, name: true, description: true, priceCents: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ items });
}

const CreateItemSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  priceCents: z.number().int().min(1),
  isActive: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Admin only" } }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateItemSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const item = await prisma.item.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      priceCents: parsed.data.priceCents,
      isActive: parsed.data.isActive ?? true,
    },
    select: { id: true, name: true, description: true, priceCents: true, isActive: true },
  });

  return Response.json({ item }, { status: 201 });
}
