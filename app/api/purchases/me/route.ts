import { NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import prisma from "@/libs/prisma";

export async function GET() {
  const user = await Decoded();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id, status: "PAID" },
    include: { album: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    purchases: purchases.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      createdAt: p.createdAt,
      album: p.album,
    })),
  });
}
