import connectDb from "@/lib/mongodb";
import Todo from "@/models/Todo";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: {id: string} } 
) {
  const { id } = context.params; 
  const { isCompleted } = await req.json();

  await connectDb();

  await Todo.findByIdAndUpdate(id, { isCompleted }, { new: true });

  return NextResponse.json(
    { message: "Todo updated successfully" },
    { status: 200 }
  );
}
