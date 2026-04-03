import prisma from "@/libs/prisma";
import { User } from "@/libs/Auth";
import { Visibility } from "@/app/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const visibility = searchParams.get("visibility");
  if (!id || !visibility) {
    return new Response("Album ID and visibility are required", {
      status: 400,
    });
  }

  try {
    const album = await prisma.album.findUnique({ where: { id } });
    if (!album) {
      return new Response("Album not found", { status: 404 });
    }

    const user = await User();
    if (!user) {
      return new Response("User not found", { status: 404 });
    }
    if (album.userId !== user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    if (album.visibility === visibility) {
      return NextResponse.json(
        { message: "Album already has this visibility" },
        { status: 200 },
      );
    }

    await prisma.album.update({
      where: { id },
      data: { visibility: visibility as Visibility },
    });

    return NextResponse.json(
      { message: "Album visibility updated" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating album visibility:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
