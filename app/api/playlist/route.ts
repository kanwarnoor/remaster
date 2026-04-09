import { NextResponse } from "next/server";
import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";

export async function GET() {
  try {
    const user = await User();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playlists = await prisma.playlist.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        tracks: {
          orderBy: { sort: "asc" },
          take: 1,
          include: { track: { select: { image: true } } },
        },
      },
    });

    // Map playlists to include a cover image (from first track if no playlist image)
    const mapped = playlists.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      image: p.image || p.tracks[0]?.track?.image || null,
      visibility: p.visibility,
      default: p.default,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      userId: p.userId,
    }));

    return NextResponse.json({ playlists: mapped }, { status: 200 });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
