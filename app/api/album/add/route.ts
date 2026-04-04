import { NextRequest, NextResponse } from "next/server";
import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import { generateKeyBetween } from "fractional-indexing";

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sort: generateKeyBetween(lastEntry ? String(lastEntry.sort) : null, null) as any,
      },
    });

    return NextResponse.json({ message: "Track added to album!" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error)
    return NextResponse.json({ message: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}
