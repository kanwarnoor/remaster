import { NextRequest, NextResponse } from "next/server";

import { User as Decoded } from "@/libs/Auth";
import Track from "@/models/Track";
import connectDb from "@/libs/connectDb";

export async function GET(req: NextRequest) {
  const user = await Decoded();

  if (user == null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDb();
    
    const tracks = await Track.find({ user: user._id });

    if (!tracks) {
      return NextResponse.json({ error: "No tracks found" }, { status: 404 });
    }

    return NextResponse.json(tracks, { status: 200 });
  } catch (error) {
    console.error("Error fetching tracks: ", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
