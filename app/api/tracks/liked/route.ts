import { NextResponse } from "next/server";
import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";

export async function GET() {
  try {
    const user = await User();
    if (!user) {
      return NextResponse.json({ trackIds: [] }, { status: 200 });
    }

    const fav = await prisma.playlist.findFirst({
      where: { userId: user.id, name: "Favourites", default: true },
      include: { tracks: { select: { trackId: true } } },
    });

    const trackIds = fav ? fav.tracks.map((t) => t.trackId) : [];
    return NextResponse.json({ trackIds }, { status: 200 });
  } catch (error) {
    console.error("Error fetching liked tracks:", error);
    return NextResponse.json({ trackIds: [] }, { status: 200 });
  }
}
