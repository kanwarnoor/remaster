import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/libs/connectDb";

export async function GET(req: NextRequest) {
  await connectDb();
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");

  try {
    const tracks = await prisma.track.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ tracks }, { status: 200 });
  } catch (error) {
    console.log("Error fetching tracks: ", error);
    return NextResponse.json(
      { message: "Error fetching tracks" },
      { status: 500 }
    );
  }
}