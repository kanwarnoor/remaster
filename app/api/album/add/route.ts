import { NextRequest, NextResponse } from "next/server";
import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";

export async function POST(req: NextRequest) {
  const { albumId, trackId } = await req.json();

  if (!albumId || !trackId) {
    return NextResponse.json(
      { message: "albumId and trackId are required!" },
      { status: 400 }
    );
  }

  try {
    const user = await User();

    if (!user) {
      return NextResponse.json({ message: "Not authorized!" }, { status: 401 });
    }

    const album = await prisma.album.findUnique({ where: { id: albumId } });

    if (!album) {
      return NextResponse.json({ message: "Album does not exist!" }, { status: 404 });
    }

    if (album.userId !== user.id) {
      return NextResponse.json({ message: "Not authorized!" }, { status: 401 });
    }

    const track = await prisma.track.findUnique({ where: { id: trackId } });

    if (!track) {
      return NextResponse.json({ message: "Track does not exist!" }, { status: 404 });
    }

    const lastEntry = await prisma.albumTracks.findFirst({
      where: { albumId },
      orderBy: { sort: "desc" },
    });

    await prisma.albumTracks.create({
      data: {
        albumId,
        trackId,
        sort: lastEntry ? lastEntry.sort + 1 : 1,
      },
    });

    return NextResponse.json({ message: "Track added to album!" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
