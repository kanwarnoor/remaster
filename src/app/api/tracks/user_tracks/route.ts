import { NextRequest, NextResponse } from "next/server";

import { User as Decoded } from "@/libs/Auth";
import User from "@/models/User";
import Track from "@/models/Track";

export async function GET(req: NextRequest) {
  const user = await Decoded();

  if (user == null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tracks = await Track.find({ user: user._id });

    if (!tracks) {
      return NextResponse.json({ error: "No tracks found" }, { status: 404 });
    }

    return NextResponse.json(tracks, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}
