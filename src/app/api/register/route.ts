import connectDb from "@/libs/connectDb";
import User from "@/models/User";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";

export default async function POST(request: NextRequest) {
  const { username, email, password } = await request.json();

  await connectDb();
  
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.create(username, email, hashedPassword);
    return { status: 201, body: { message: "User created" } };
  } catch (err: any) {
    return { status: 500, body: { message: err.message } };
  }
}
