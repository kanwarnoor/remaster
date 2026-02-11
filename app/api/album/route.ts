import connectDb from "@/libs/connectDb";
import { toInteger } from "lodash";
import { NextRequest, NextResponse } from "next/server";
import { User as Auth } from "@/libs/Auth";
import prisma from "@/libs/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await Auth();

    if (!user) {
      return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
    }

    await connectDb();

    const album = await prisma.album.findMany({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    return NextResponse.json({ album }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
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

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
    }

    const album = await prisma.album.create({
      data: {
        name,
        user: {
          connect: {
            id: user.id,
          },
        },
        artist: user.username,
        description: description,
        tracks: {
          connect: track_ids.map((id: string) => ({ id })),
        },
        image: image,
      },
    });

    await prisma.track.updateMany({
      where: { id: { in: track_ids } },
      data: { albumId: album.id },
    });

    return NextResponse.json({ album }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
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

    const album = await prisma.album.findUnique({
      where: { id: id || (undefined as string | undefined) },
    });

    return NextResponse.json({ message: "Deleted album" }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
