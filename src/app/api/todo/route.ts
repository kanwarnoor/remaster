import connectDb from "@/lib/mongodb";
import Todo from "@/models/Todo";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title } = await req.json();
  await connectDb();
  await Todo.create({ title });
  return NextResponse.json(
    { message: "Task added successfully" },
    { status: 200 }
  );
}

export async function GET() {
  await connectDb();
  const todos = await Todo.find();
  return NextResponse.json(todos, { status: 200 });
}