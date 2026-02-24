import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Album ID is required", { status: 400 });
    }

    const album = await prisma.album.findUnique({
      where: { id },
      include: { tracks: true },
    });

    if (!album) {
      return NextResponse.json({ message: "Album not found" }, { status: 404 });
    }

    return NextResponse.json({ album, tracks: album.tracks }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
