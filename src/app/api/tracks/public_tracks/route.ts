import Track from "@/models/Track";
import { NextResponse } from "next/server";
import connectDb from "@/libs/connectDb";

export async function GET(request: Request) {
  await connectDb();

  try {
    const tracks = await Track.find({ visibility: "public" }).sort({ createdAt: -1 });

    return NextResponse.json({ tracks }, { status: 200 });
  } catch (error) {
    console.log("Error fetching tracks: ", error);
    return NextResponse.json(
      { message: "Error fetching tracks" },
      { status: 500 }
    );
  }
}
