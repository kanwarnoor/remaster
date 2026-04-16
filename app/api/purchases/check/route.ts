import { NextRequest, NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import prisma from "@/libs/prisma";

export async function GET(req: NextRequest) {
  const albumId = req.nextUrl.searchParams.get("albumId");
  if (!albumId) {
    return NextResponse.json({ error: "Missing albumId" }, { status: 400 });
  }

  const user = await Decoded();
  if (!user) {
    return NextResponse.json({ owned: false });
  }

  const album = await prisma.album.findUnique({
    where: { id: albumId },
    select: { userId: true },
  });
  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  if (album.userId === user.id) {
    return NextResponse.json({ owned: true, reason: "creator" });
  }

  const purchase = await prisma.purchase.findFirst({
    where: { userId: user.id, albumId, status: "PAID" },
  });

  return NextResponse.json({
    owned: !!purchase,
    reason: purchase ? "purchased" : null,
  });
}
