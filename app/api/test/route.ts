import { NextResponse } from "next/server";
import connectDb from "@/libs/connectDb";
import Album from "@/models/Album";

export async function GET(request: Request) {
  await connectDb();

  const album = await Album.findById("68650acc12852e03800a5c2f");

  album.image = null;
  album.save();

  return NextResponse.json(album);
}