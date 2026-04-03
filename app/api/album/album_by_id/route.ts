import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { User } from "@/libs/Auth";

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

    if (album.visibility === "PRIVATE") {
      const user = await User();
      if (!user) {
        return NextResponse.json(
          { message: "not authorized" },
          { status: 404 },
        );
      }

      if (user.id !== album.userId) {
        return NextResponse.json(
          { message: "not authorized" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json({ album, tracks: album.tracks }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "An unknown error occurred";
    return NextResponse.json({ message }, { status: 500 });
  }
}