import Track from "@/models/Track";
import { NextResponse } from "next/server";
import connectDb from "@/libs/connectDb";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    const track = await Track.findById(id);

    if (!track) {
      return NextResponse.json({ error: "No track found!" }, { status: 404 });
    }

    return NextResponse.json(track, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something unexpected happened!" },
      { status: 500 }
    );
  }
}
