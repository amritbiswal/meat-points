import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { getServerSession } from "next-auth";

const UpdateItemSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  priceCents: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).role !== "ADMIN") {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Admin only" } },
      { status: 401 },
    );
  }

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = UpdateItemSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  const updated = await prisma.item.update({
    where: { id },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      isActive: true,
    },
  });

  return Response.json({ item: updated });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Admin only" } },
      { status: 401 },
    );
  }

  const { id } = await params;

  await prisma.item.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
