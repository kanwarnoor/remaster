import { NextRequest, NextResponse } from "next/server";

import { User as Decoded } from "@/libs/Auth";
import prisma from "@/libs/prisma";

export async function GET(req: NextRequest) {
  const user = await Decoded();

  if (user == null || !user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tracks = await prisma.track.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!tracks) {
      return NextResponse.json({ error: "No tracks found" }, { status: 404 });
    }

    return NextResponse.json({ tracks }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tracks: ", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
