import connectDb from "@/libs/connectDb";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function POST(req: NextRequest, res: NextResponse) {
  const { username, password } = await req.json();

  await connectDb();

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json({ error: "User not found", status: 404 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Invalid password", status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return NextResponse.json({ token });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
