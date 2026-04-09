import { NextRequest, NextResponse } from "next/server";
import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import { generateKeyBetween } from "fractional-indexing";

export async function POST(req: NextRequest) {
  try {
    const { trackId } = await req.json();
    const user = await User();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const track = await prisma.track.findUnique({ where: { id: trackId } });
    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // create liked songs playlist if not exists
    let fav = await prisma.playlist.findFirst({
      where: { userId: user.id, name: "Favourites", default: true },
    });

    if (!fav) {
      fav = await prisma.playlist.create({
        data: {
          userId: user.id,
          name: "Favourites",
          default: true,
        },
      });
    }

    // check if track is already in favourites
    const existing = await prisma.playlistTracks.findFirst({
      where: { playlistId: fav.id, trackId: track.id },
    });

    if (existing) {
      // unlike - remove from favourites
      await prisma.playlistTracks.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false }, { status: 200 });
    }

    // like - add to favourites
    const lastEntry = await prisma.playlistTracks.findFirst({
      where: { playlistId: fav.id },
      orderBy: { sort: "desc" },
    });
    await prisma.playlistTracks.create({
      data: {
        playlistId: fav.id,
        trackId: track.id,
        sort: generateKeyBetween(lastEntry ? String(lastEntry.sort) : null, null),
      },
    });

    return NextResponse.json({ liked: true }, { status: 200 });
  } catch (error) {
    console.error("Error in liking track:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
