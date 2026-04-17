import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");

  try {
    // Fetch public tracks
    const tracks = await prisma.track.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const albums = await prisma.album.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Collect all items (tracks + albums) by release date (createdAt) descending
    // Label source type for later differentiation
    const normalizedTracks = tracks.map((track) => ({
      ...track,
      type: "track",
      releaseDate: track.updatedAt,
    }));
    const normalizedAlbums = albums.map((album) => ({
      ...album,
      type: "album",
      releaseDate: album.updatedAt,
    }));

    const combined = [...normalizedTracks, ...normalizedAlbums].sort(
      (a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
    );

    const result = combined.slice(0, limit);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.log("Error fetching tracks and albums: ", error);
    return NextResponse.json(
      { message: "Error fetching tracks and albums" },
      { status: 500 },
    );
  }
}
