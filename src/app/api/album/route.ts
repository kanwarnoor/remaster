import connectDb from "@/libs/connectDb";
import Album from "@/models/Album";
import User from "@/models/User";
import { toInteger } from "lodash";
import { NextRequest, NextResponse } from "next/server";
import { User as Auth } from "@/libs/Auth";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const limit = toInteger(req.nextUrl.searchParams.get("limit"));

    await connectDb();

    const album = await Album.find();

    return NextResponse.json({ album }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { name, description, track } = await req.json();

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
      description: description || null,
      tracks: track,
    });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}