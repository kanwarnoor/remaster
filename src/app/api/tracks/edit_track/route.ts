import { NextRequest, NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import connectDb from "@/libs/connectDb";
import Track from "@/models/Track";

export async function PATCH(req: NextRequest) {
  try {
    const { id, name, artist, art } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const user = await Decoded();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDb();

    const track = await Track.findById(id);

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    if (track.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "You are not authorized to edit this track" },
        { status: 403 }
      );
    }

    if (name) {
      track.name = name;
    }
    if (artist) {
      track.artist = artist;
    }
    if (art) {
      // track.art = art;
    }
    await track.save();

    return NextResponse.json(
      { message: "Track updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating track:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}