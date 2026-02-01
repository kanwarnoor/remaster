import prisma from "@/libs/prisma";
import { User } from "@/libs/Auth";
import { Visibility } from "@/app/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const visibility = searchParams.get("visibility");
  if (!id || !visibility) {
    return new Response("Track ID and visibility are required", {
      status: 400,
    });
  }

  try {
    const track = await prisma.track.findUnique({ where: { id } });
    if (!track) {
      return new Response("Track not found", { status: 404 });
    }
    // check if track belong to user
    const user = await User();
    if (!user) {
      return new Response("User not found", { status: 404 });
    }
    if (track.userId !== user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    if (track.visibility === visibility) {
      return NextResponse.json({ message: "Track already has this visibility" }, { status: 200 });
    }
    await prisma.track.update({
      where: { id },
      data: { visibility: visibility as Visibility },
    });
    return NextResponse.json(
      { message: "Track visibility updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating track visibility:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
