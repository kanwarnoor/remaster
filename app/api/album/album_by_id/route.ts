import connectDb from "@/libs/connectDb";
import Album from "@/models/Album";
import Track from "@/models/Track";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await connectDb();

    if (!id) {
      return new Response("Album ID is required", { status: 400 });
    }

    const album = await Album.findById(id);
    const tracks = await Track.find({ _id: { $in: album.tracks } });

    return NextResponse.json({ album, tracks }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}