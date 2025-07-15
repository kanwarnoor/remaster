import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/libs/connectDb";
import Album from "@/models/Album";

export async function POST(req: NextRequest) {
  try {
    const { albumId, trackId } = await req.json();

    await connectDb();

    const album = await Album.findById(albumId);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
