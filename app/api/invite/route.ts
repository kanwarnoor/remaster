import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const invite = await prisma.invite.findUnique({
      where: {
        code: code,
      },
    });
    if (!invite) {
      return NextResponse.json({ error: "Invalid code" }, { status: 404 });
    }
    if (invite.claimed) {
      return NextResponse.json(
        { error: "Invite already claimed" },
        { status: 403 }
      );
    }

    return NextResponse.json({ message: "Invite found" }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
