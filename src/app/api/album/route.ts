import connectDb from "@/libs/connectDb";
import Album from "@/models/Album";
import User from "@/models/User";
import { toInteger } from "lodash";
import { NextRequest, NextResponse } from "next/server";
import { User as Auth } from "@/libs/Auth";
import Track from "@/models/Track";

export async function GET(req: NextRequest) {
  try {
    const limit = toInteger(req.nextUrl.searchParams.get("limit"));

    const user = await Auth();

    if (!user) {
      return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
    }

    await connectDb();

    const album = await Album.find({ user: user._id });

    return NextResponse.json({ album }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, track_ids, image, artist } = await req.json();

    const decoded = await Auth();

    if (!decoded) {
      return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
    }
    await connectDb();

    const user = await User.findById(decoded._id);

    if (!user) {
      return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
    }

    const album = await Album.create({
      name,
      user: user._id,
      artist: artist || user.name,
      description: description || null,
      tracks: [track_ids],
      image: image || null,
    });

    await Track.updateMany({ _id: { $in: track_ids } }, { album: album._id });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    console.log(id);

    const decoded = await Auth();

    if (!decoded) {
      return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
    }

    await connectDb();

    const album = await Album.findById(id);

    if (!album) {
      return NextResponse.json({ message: "Album not found" }, { status: 404 });
    }

    if (album.user.toString() !== decoded._id) {
      return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
    }

    await Album.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted album" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}