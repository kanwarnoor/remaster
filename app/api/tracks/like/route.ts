import { NextRequest, NextResponse } from "next/server";
import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import { generateKeyBetween } from "fractional-indexing";

export default async function POST(req: NextRequest) {
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

    // create like songs playlist if not exists
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

    // add track to favourites playlist
    const lastEntry = await prisma.playlistTracks.findFirst({
      where: { playlistId: fav.id },
      orderBy: { sort: "desc" },
    });
    await prisma.playlistTracks.create({
      data: {
        playlistId: fav.id,
        trackId: track.id ?? "",
        sort: generateKeyBetween(lastEntry ? String(lastEntry.sort) : null, null),
      },
    });

    return NextResponse.json({ message: "Track added to favourites!" }, { status: 200 });
  } catch (error) {
    console.error("Error in liking track:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
