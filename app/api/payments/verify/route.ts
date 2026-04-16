import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { User as Decoded } from "@/libs/Auth";
import prisma from "@/libs/prisma";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    const user = await Decoded();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const sigBuf = Buffer.from(razorpay_signature);
    const expBuf = Buffer.from(expected);
    const valid =
      sigBuf.length === expBuf.length &&
      crypto.timingSafeEqual(sigBuf, expBuf);

    const purchase = await prisma.purchase.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });
    if (!purchase) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (purchase.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!valid) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: "FAILED", razorpayPaymentId: razorpay_payment_id },
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        status: "PAID",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });

    return NextResponse.json({ ok: true, albumId: purchase.albumId });
  } catch (error) {
    console.error("verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
