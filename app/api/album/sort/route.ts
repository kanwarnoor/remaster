import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { albumId, trackId, sort } = await req.json();

    if (!albumId || !trackId || !sort) {
      return NextResponse.json(
        { message: "albumId, trackId and sort are required!" },
        { status: 400 },
      );
    }

    const album = await prisma.album.findUnique({ where: { id: albumId } });

    if (!album) {
      return NextResponse.json(
        { message: "Album does not exist!" },
        { status: 404 },
      );
    }

    const user = await User();
    if (!user) {
      return NextResponse.json({ message: "Not authorized!" }, { status: 401 });
    }

    if (album.userId !== user.id) {
      return NextResponse.json({ message: "Not authorized!" }, { status: 401 });
    }

    const albumTrack = await prisma.albumTracks.findUnique({
      where: { albumId_trackId: { albumId, trackId } },
    });

    if (!albumTrack) {
      return NextResponse.json(
        { message: "Track does not exist in album!" },
        { status: 404 },
      );
    }

    await prisma.albumTracks.update({
      where: { albumId_trackId: { albumId, trackId } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { sort: sort.toString() as any },
    });

    return NextResponse.json({ message: "Sort updated!" }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "An unknown error occurred";
    return NextResponse.json({ message: message }, { status: 500 });
  }
}
