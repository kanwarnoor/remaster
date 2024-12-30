import connectDb from "@/lib/mongodb";
import Todo from "@/models/Todo";
import { NextResponse } from "next/server";

export async function PUT(
  req: NextResponse,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { title } = await req.json();
  await connectDb();

  await Todo.findByIdAndUpdate(id, { title }, { new: true });

  return NextResponse.json(
    { message: "Todo updated successfully" },
    { status: 200 }
  );
}
