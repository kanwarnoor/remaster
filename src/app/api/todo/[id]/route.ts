import connectDb from "@/lib/mongodb";
import Todo from "@/models/Todo";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDb();
  await Todo.findByIdAndDelete(id);

  return NextResponse.json(
    { message: "Todo deleted successfully" },
    { status: 200 }
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  await connectDb();

  const todo = await Todo.findById(id);

  return NextResponse.json(todo, { status: 200 });
}