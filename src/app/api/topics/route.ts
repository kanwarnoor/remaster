import { NextRequest, NextResponse } from "next/server";
import connectDB from "lib/mongodb";
import Topic from "models/topic";

export async function POST(req: NextRequest) {
  const { title, description } = await req.json();
  await connectDB();
  await Topic.create({ title, description });
  return NextResponse.json({
    message: "Topic created successfully",
    status: 200,
  });
}

export async function GET() {
  await connectDB();
  const topics = await Topic.find();
  return NextResponse.json({ topics });
}

export async function DELETE(req: NextRequest){
  // get id from url
  const id = req.nextUrl.searchParams.get('id');
  await connectDB();
  await Topic.findByIdAndDelete(id);
  return NextResponse.json({
    message: "Topic deleted successfully",
    status: 200,
  });
}