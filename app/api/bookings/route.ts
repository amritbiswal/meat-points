import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { getServerSession } from "next-auth";

const CreateBookingSchema = z.object({
  itemId: z.string().min(1),
  qty: z.number().int().min(1).max(50),
  customerName: z.string().min(2),
  phone: z.string().min(8).max(20),
  fulfillment: z.enum(["PICKUP", "DELIVERY"]),
  note: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CreateBookingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const item = await prisma.item.findUnique({
    where: { id: parsed.data.itemId },
    select: { id: true, isActive: true },
  });

  if (!item || !item.isActive) {
    return Response.json({ error: { code: "NOT_FOUND", message: "Item not available" } }, { status: 404 });
  }

  const booking = await prisma.booking.create({
    data: parsed.data,
    select: { id: true, createdAt: true },
  });

  return Response.json({ booking }, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Admin only" } }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      qty: true,
      customerName: true,
      phone: true,
      fulfillment: true,
      note: true,
      createdAt: true,
      item: { select: { id: true, name: true } },
    },
  });

  return Response.json({ bookings });
}
