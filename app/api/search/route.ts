import { NextResponse } from "next/server";
import connectDb from "@/libs/connectDb";
import Track from "@/models/Track";
import Album from "@/models/Album";
import User from "@/models/User";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "No query provided" }, { status: 400 });
  }
  await connectDb();

  try {
    const tracks = await Track.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { artist: { $regex: q, $options: "i" } }
      ]
    }).limit(5);
    const albums = await Album.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { artist: { $regex: q, $options: "i" } }
      ]
    }).limit(5);
    const users = await User.find({ username: { $regex: q, $options: "i" } }).limit(5);
    
    return NextResponse.json({ tracks, albums, users });
  } catch (error) {
    console.error("Error searching tracks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
