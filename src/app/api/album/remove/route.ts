import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/libs/connectDb";
import Album from "@/models/Album";
import Track from "@/models/Track";
import { User } from "@/libs/Auth";

export async function POST(req: NextRequest) {
  const { albumId, trackId } = await req.json();

  if (!albumId || !trackId) {
    return NextResponse.json(
      { message: "albumid and trackid is required!" },
      { status: 404 }
    );
  }

  try {
    await connectDb();

    const album = await Album.findById(albumId);
    const track = await Track.findById(trackId);

    if (!album || !track) {
      return NextResponse.json(
        { message: "Album or Track does not exist!" },
        { status: 404 }
      );
    }

    // check if the album belongs to the user
    const user = await User();

    if (!user || user._id != album.user) {
      return NextResponse.json({ message: "Not authorized!" }, { status: 401 });
    }

    // remove the track from the album
    album.tracks = album.tracks.filter((id: string) => id !== trackId);
    await album.save();

    return NextResponse.json(
      { message: "Track removed from album!" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
