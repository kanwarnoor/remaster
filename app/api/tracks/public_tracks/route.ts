import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";
import connectDb from "@/libs/connectDb";

export async function GET(request: Request) {
  await connectDb();

  try {
    const tracks = await prisma.track.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: { createdAt: "desc" },
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
