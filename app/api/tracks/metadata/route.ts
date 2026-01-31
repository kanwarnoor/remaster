import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/libs/connectDb";
import Track from "@/models/Track";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Track ID is required" },
      { status: 400 }
    );
  }

  await connectDb();

  const track = await Track.findById(id);
  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  return NextResponse.json({ track });
}
