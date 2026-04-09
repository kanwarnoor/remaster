import { NextRequest, NextResponse } from "next/server";
import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";

export async function POST(req: NextRequest) {
  try {
    const { playlistId, trackId } = await req.json();
    const user = await User();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist || playlist.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const entry = await prisma.playlistTracks.findFirst({
      where: { playlistId, trackId },
    });
    if (!entry) {
      return NextResponse.json({ error: "Track not in playlist" }, { status: 404 });
    }

    await prisma.playlistTracks.delete({ where: { id: entry.id } });

    return NextResponse.json({ message: "Track removed" }, { status: 200 });
  } catch (error) {
    console.error("Error removing track from playlist:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
