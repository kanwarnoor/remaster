import Track from "@/models/Track";
import { NextResponse } from "next/server";
import { User } from "@/libs/Auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Track ID is required", { status: 400 }); // should be 400 for missing ID
  }

  const user = await User();

  console.log("user:", user);

  try {
    const track = await Track.findById(id);
    if (!track) {
      return new Response("Track not found", { status: 404 });
    }
    const isOwner = !!user && track.user.toString() === user._id.toString();

    if (track.visibility === "private" && !isOwner) {
      return new Response("Forbidden", { status: 403 });
    }

    return NextResponse.json(track, { status: 200 });
  } catch (error) {
    console.error("Error loading track:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
