import connectDb from "@/libs/connectDb";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  await connectDb();

  // Check if user exists
  let user;
  try {
    user = await User.findOne({
      $or: [{ email: username }, { username }],
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Check if password is correct
  try {
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // make a token
  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET || "nimda",
    { expiresIn: "1h" }
  );

  (await cookies()).set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60, // 1 week
    path: "/",
  });

  return NextResponse.json(
    { message: "User logged in successfully!", token },
    { status: 200 }
  );
}
