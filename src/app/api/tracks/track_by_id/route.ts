import Track from "@/models/Track";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Track ID is required", { status: 400 });
  }

  try {
    const track = await Track.findById(id);
    if (!track) {
      return new Response("Track not found", { status: 404 });
    }
    return NextResponse.json(track, { status: 200 });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
