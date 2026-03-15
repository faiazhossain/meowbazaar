import { NextRequest, NextResponse } from "next/server";
import { cancelPayment } from "@/lib/actions/payments";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.redirect(new URL("/checkout?error=invalid", request.url));
  }

  try {
    // Find the payment record and update to cancelled
    const payment = await db.payment.findFirst({
      where: {
        orderId,
        gateway: "SSLCOMMERZ",
      },
    });

    if (payment) {
      await cancelPayment({
        paymentId: payment.id,
        orderId,
        gateway: "SSLCOMMERZ",
      });
    }

    return NextResponse.redirect(
      new URL(`/checkout?error=payment_cancelled&order_id=${orderId}`, request.url)
    );
  } catch (error) {
    console.error("SSLCommerz cancel callback error:", error);
    return NextResponse.redirect(new URL("/checkout?error=payment_cancelled", request.url));
  }
}
