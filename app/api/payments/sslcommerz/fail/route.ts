import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.redirect(new URL("/checkout?error=invalid", request.url));
  }

  try {
    // Find the payment record and update to failed
    const payment = await db.payment.findFirst({
      where: {
        orderId,
        gateway: "SSLCOMMERZ",
      },
    });

    if (payment) {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.redirect(
      new URL(`/checkout?error=payment_failed&order_id=${orderId}`, request.url)
    );
  } catch (error) {
    console.error("SSLCommerz fail callback error:", error);
    return NextResponse.redirect(new URL("/checkout?error=payment_failed", request.url));
  }
}
