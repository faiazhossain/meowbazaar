import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/actions/payments";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.redirect(new URL("/checkout?error=invalid", request.url));
  }

  try {
    // Get the SSLCommerz response
    const tran_id = searchParams.get("tran_id");
    const val_id = searchParams.get("val_id");

    if (!tran_id || !val_id) {
      return NextResponse.redirect(
        new URL(`/checkout?error=payment_failed&order_id=${orderId}`, request.url)
      );
    }

    // Find the payment record
    const payment = await db.payment.findFirst({
      where: {
        orderId,
        gateway: "SSLCOMMERZ",
      },
    });

    if (!payment) {
      return NextResponse.redirect(new URL("/checkout?error=payment_not_found", request.url));
    }

    // Verify payment
    const result = await verifyPayment({
      paymentId: payment.id,
      orderId,
      gateway: "SSLCOMMERZ",
    });

    if (result.success) {
      return NextResponse.redirect(
        new URL(`/orders/${orderId}?payment=success`, request.url)
      );
    }

    return NextResponse.redirect(
      new URL(`/checkout?error=payment_failed&order_id=${orderId}`, request.url)
    );
  } catch (error) {
    console.error("SSLCommerz success callback error:", error);
    return NextResponse.redirect(new URL("/checkout?error=payment_failed", request.url));
  }
}
