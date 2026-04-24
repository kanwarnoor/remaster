import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generateKeyBetween } from "fractional-indexing";

export async function PATCH(req: NextRequest) {
  try {
    const { albumId, trackIds } = await req.json();

    if (!albumId || !Array.isArray(trackIds) || trackIds.length === 0) {
      return NextResponse.json(
        { message: "albumId and trackIds[] are required!" },
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

    const existing = await prisma.albumTracks.findMany({
      where: { albumId },
      select: { trackId: true },
    });
    const existingIds = new Set(existing.map((e) => e.trackId));

    const validOrderedIds = trackIds.filter(
      (id: unknown): id is string =>
        typeof id === "string" && existingIds.has(id),
    );

    if (validOrderedIds.length === 0) {
      return NextResponse.json(
        { message: "No valid tracks to sort!" },
        { status: 400 },
      );
    }

    let prevKey: string | null = null;
    const updates = validOrderedIds.map((trackId) => {
      prevKey = generateKeyBetween(prevKey, null);
      const key = prevKey;
      return prisma.albumTracks.update({
        where: { albumId_trackId: { albumId, trackId } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { sort: key as any },
      });
    });

    await prisma.$transaction(updates);

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
