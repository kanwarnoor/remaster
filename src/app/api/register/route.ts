import connectDb from "@/libs/connectDb";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  const { username, email, password } = await request.json();

  await connectDb();

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.create({
      username,
      email,
      password: hashedPassword,
      premium: false,
    });
    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  await connectDb();
  const users = await User.find();
  return NextResponse.json({users});
}