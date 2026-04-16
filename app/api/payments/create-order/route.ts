import { NextRequest, NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import { getRazorpay } from "@/libs/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { albumId } = await req.json();
    if (!albumId) {
      return NextResponse.json({ error: "Missing albumId" }, { status: 400 });
    }

    const user = await Decoded();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }
    if (!album.forSale || album.price == null || album.price <= 0) {
      return NextResponse.json({ error: "Album is not for sale" }, { status: 400 });
    }
    if (album.userId === user.id) {
      return NextResponse.json({ error: "Cannot buy your own album" }, { status: 400 });
    }

    const existingPaid = await prisma.purchase.findFirst({
      where: { userId: user.id, albumId, status: "PAID" },
    });
    if (existingPaid) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: album.price,
      currency: album.currency || "INR",
      receipt: `album_${albumId.slice(0, 8)}_${Date.now()}`,
      notes: { albumId, buyerId: user.id },
    });

    await prisma.purchase.create({
      data: {
        userId: user.id,
        albumId,
        amount: album.price,
        currency: album.currency || "INR",
        razorpayOrderId: order.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      albumName: album.name,
      albumArtist: album.artist,
    });
  } catch (error) {
    console.error("create-order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
