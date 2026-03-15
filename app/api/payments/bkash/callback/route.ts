import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/actions/payments";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("order_id");

    const body = await request.json();
    const paymentID = body.paymentID;
    const status = body.status;

    if (!orderId || !paymentID) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Find the payment record
    const payment = await db.payment.findFirst({
      where: {
        orderId,
        gateway: "BKASH",
      },
    });

    if (!payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
    }

    if (status === "completed" || status === "success") {
      // Verify payment
      await verifyPayment({
        paymentId: payment.id,
        orderId,
        gateway: "BKASH",
      });
    } else {
      // Mark as failed
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("bKash callback error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
