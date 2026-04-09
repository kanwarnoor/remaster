import { NextRequest, NextResponse } from "next/server";
import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const user = await User();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playlist = await prisma.playlist.findUnique({ where: { id } });
    if (!playlist || playlist.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete all playlist tracks first, then the playlist
    await prisma.playlistTracks.deleteMany({ where: { playlistId: id } });
    await prisma.playlist.delete({ where: { id } });

    return NextResponse.json({ message: "Playlist deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
