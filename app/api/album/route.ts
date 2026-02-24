
import { NextRequest, NextResponse } from "next/server";
import { User as Auth } from "@/libs/Auth";
import prisma from "@/libs/prisma";

export async function GET(req: NextRequest) {
  console.log("[GET /api/album] request received");
  try {
    const user = await Auth();
    console.log("[GET /api/album] user:", user);

    if (!user) {
      console.log("[GET /api/album] unauthorized - no user");
      return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
    }

    const album = await prisma.album.findMany({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    console.log("[GET /api/album] found albums:", album.length);
    return NextResponse.json({ album }, { status: 200 });
  } catch (error: unknown) {
    console.error("[GET /api/album] error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  console.log("[POST /api/album] request received");
  try {
    const body = await req.json();
    console.log("[POST /api/album] body:", body);
    const { name, description, track_ids, image, artist } = body;

    const decoded = await Auth();
    console.log("[POST /api/album] decoded user:", decoded);

    if (!decoded) {
      console.log("[POST /api/album] unauthorized - no decoded user");
      return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    console.log("[POST /api/album] prisma user:", user);

    if (!user) {
      console.log("[POST /api/album] user not found in db");
      return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
    }

    console.log("[POST /api/album] creating album with track_ids:", track_ids);

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

    console.log("[POST /api/album] album created:", album);

    await prisma.track.updateMany({
      where: { id: { in: track_ids } },
      data: { albumId: album.id },
    });

    console.log("[POST /api/album] tracks updated with albumId:", album.id);

    return NextResponse.json({ album }, { status: 200 });
  } catch (error: unknown) {
    console.error("[POST /api/album] error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  console.log("[DELETE /api/album] request received");
  try {
    const id = req.nextUrl.searchParams.get("id");
    console.log("[DELETE /api/album] id:", id);

    const decoded = await Auth();
    console.log("[DELETE /api/album] decoded user:", decoded);

    if (!decoded) {
      console.log("[DELETE /api/album] unauthorized - no decoded user");
      return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
    }

    const album = await prisma.album.findUnique({
      where: { id: id || (undefined as string | undefined) },
    });

    console.log("[DELETE /api/album] found album:", album);

    return NextResponse.json({ message: "Deleted album" }, { status: 200 });
  } catch (error: unknown) {
    console.error("[DELETE /api/album] error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
