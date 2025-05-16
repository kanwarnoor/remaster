import { NextResponse } from "next/server";
import Track from "@/models/Track";
import connectDb from "@/libs/connectDb";

export async function POST(req: Request) {
  await connectDb();

  const tracks = await Track.find({});

  tracks.forEach(async (track) => {
    if (track._id != "681f379e8a409a5732c0029c") {
      track.image = true;
      await track.save();
    }
  });

  return NextResponse.json({ message: "Tracks updated" });
}
