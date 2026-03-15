import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/actions/payments";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tran_id = body.tran_id;
    const val_id = body.val_id;

    if (!tran_id || !val_id) {
      return NextResponse.json({ status: "FAILED" }, { status: 400 });
    }

    // Find payment by session key
    const payment = await db.payment.findFirst({
      where: {
        sessionId: val_id,
        gateway: "SSLCOMMERZ",
      },
    });

    if (!payment) {
      return NextResponse.json({ status: "FAILED" }, { status: 404 });
    }

    // Verify and update payment
    await verifyPayment({
      paymentId: payment.id,
      orderId: payment.orderId,
      gateway: "SSLCOMMERZ",
    });

    return NextResponse.json({ status: "SUCCESS" });
  } catch (error) {
    console.error("SSLCommerz IPN error:", error);
    return NextResponse.json({ status: "FAILED" }, { status: 500 });
  }
}
