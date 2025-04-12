import Track from "@/models/Track";
import { NextResponse } from "next/server";
import connectDb from "@/libs/connectDb";

export async function GET(request: Request) {
  await connectDb();

  try {
    const track = await Track.find({ visibility: "public" });

    if (!track || track.length === 0) {
      return NextResponse.json({ message: "No tracks found" }, { status: 404 });
    }

    return NextResponse.json(track, { status: 200 });
  } catch (error) {
    console.log("Error fetching tracks: ", error);
    return NextResponse.json(
      { message: "Error fetching tracks" },
      { status: 500 }
    );
  }
}