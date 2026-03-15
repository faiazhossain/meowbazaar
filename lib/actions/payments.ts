"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export interface PaymentInitRequest {
  amount: number;
  orderId: string;
  currency?: string;
}

export interface PaymentInitResponse {
  success: boolean;
  error?: string;
  paymentUrl?: string;
  paymentId?: string;
  gateway?: string;
}

export interface PaymentVerifyRequest {
  paymentId: string;
  orderId: string;
  gateway: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  error?: string;
  transactionId?: string;
}

/**
 * Initialize payment with SSLCommerz
 * @param data - Payment initialization data
 * @returns Payment URL or error
 */
export async function initSSLPayment(
  data: PaymentInitRequest
): Promise<PaymentInitResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;

    if (!storeId || !storePassword) {
      return {
        success: false,
        error: "SSLCommerz কনফিগারেশন পাওয়া যায়নি",
      };
    }

    const isSandbox = process.env.SSLCOMMERZ_SANDBOX === "true";
    const baseUrl = isSandbox
      ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
      : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

    // Get order details
    const order = await db.order.findUnique({
      where: { id: data.orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: "অর্ডার পাওয়া যায়নি" };
    }

    // Create SSLCommerz payment request
    const formData = new URLSearchParams();
    formData.append("store_id", storeId);
    formData.append("store_passwd", storePassword);
    formData.append("total_amount", data.amount.toString());
    formData.append("currency", data.currency || "BDT");
    formData.append("tran_id", order.orderNumber);
    formData.append("success_url", `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/sslcommerz/success?order_id=${data.orderId}`);
    formData.append("fail_url", `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/sslcommerz/fail?order_id=${data.orderId}`);
    formData.append("cancel_url", `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/sslcommerz/cancel?order_id=${data.orderId}`);
    formData.append("ipn_url", `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/sslcommerz/ipn`);
    formData.append("product_name", "PetBazaar Order");
    formData.append("product_category", "Pet Supplies");
    formData.append("product_profile", "non-physical-goods");
    formData.append("cus_name", order.name || session.user.name || "Customer");
    formData.append("cus_email", order.email || session.user.email || "");
    formData.append("cus_phone", order.phone || "");
    formData.append("cus_add1", order.address || "");
    formData.append("cus_city", order.city || "");
    formData.append("cus_country", "Bangladesh");
    formData.append("shipping_method", "NO");
    formData.append("multi_card_name", "bkash,nagad,visa,mastercard");

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    const result = await response.json();

    if (result.status === "SUCCESS") {
      // Create payment record
      await db.payment.create({
        data: {
          orderId: data.orderId,
          gateway: "SSLCOMMERZ",
          sessionId: result.sessionkey,
          amount: data.amount,
          status: "PENDING",
        },
      });

      return {
        success: true,
        paymentUrl: result.GatewayPageURL,
        paymentId: result.sessionkey,
        gateway: "SSLCOMMERZ",
      };
    }

    return { success: false, error: "পেমেন্ট শুরু করতে ব্যর্থ" };
  } catch (error) {
    console.error("SSLCommerz init error:", error);
    return { success: false, error: "পেমেন্ট শুরু করতে ব্যর্থ" };
  }
}

/**
 * Initialize payment with bKash
 * @param data - Payment initialization data
 * @returns Payment URL or error
 */
export async function initBkashPayment(
  data: PaymentInitRequest
): Promise<PaymentInitResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    const username = process.env.BKASH_USERNAME;
    const password = process.env.BKASH_PASSWORD;
    const appKey = process.env.BKASH_APP_KEY;
    const appSecret = process.env.BKASH_APP_SECRET;

    if (!username || !password || !appKey || !appSecret) {
      return {
        success: false,
        error: "bKash কনফিগারেশন পাওয়া যায়নি",
      };
    }

    const isSandbox = process.env.BKASH_SANDBOX === "true";
    const baseUrl = isSandbox
      ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
      : "https://tokenized.pay.bka.sh/v1.2.0-beta";

    // Get auth token
    const authResponse = await fetch(`${baseUrl}/tokenized/checkout/token/grant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        username,
        password,
      },
      body: JSON.stringify({
        app_key: appKey,
        app_secret: appSecret,
      }),
    });

    const authResult = await authResponse.json();

    if (authResult.statusCode !== "0000") {
      return { success: false, error: "bKash টোকেন পেতে ব্যর্থ" };
    }

    const idToken = authResult.id_token;

    // Get order details
    const order = await db.order.findUnique({
      where: { id: data.orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: "অর্ডার পাওয়া যায়নি" };
    }

    // Create payment
    const paymentResponse = await fetch(`${baseUrl}/tokenized/checkout/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "X-APP-Key": appKey,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: session.user.id,
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/bkash/callback?order_id=${data.orderId}`,
        amount: data.amount,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: order.orderNumber,
      }),
    });

    const paymentResult = await paymentResponse.json();

    if (paymentResult.statusCode === "0000") {
      // Create payment record
      const payment = await db.payment.create({
        data: {
          orderId: data.orderId,
          gateway: "BKASH",
          sessionId: paymentResult.paymentID,
          amount: data.amount,
          status: "PENDING",
        },
      });

      return {
        success: true,
        paymentUrl: paymentResult.bkashURL,
        paymentId: payment.id,
        gateway: "BKASH",
      };
    }

    return { success: false, error: "bKash পেমেন্ট শুরু করতে ব্যর্থ" };
  } catch (error) {
    console.error("bKash init error:", error);
    return { success: false, error: "bKash পেমেন্ট শুরু করতে ব্যর্থ" };
  }
}

/**
 * Initialize payment with Nagad
 * @param data - Payment initialization data
 * @returns Payment URL or error
 */
export async function initNagadPayment(
  data: PaymentInitRequest
): Promise<PaymentInitResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    const merchantId = process.env.NAGAD_MERCHANT_ID;
    const publicKey = process.env.NAGAD_PUBLIC_KEY;
    const privateKey = process.env.NAGAD_PRIVATE_KEY;

    if (!merchantId || !publicKey || !privateKey) {
      return {
        success: false,
        error: "Nagad কনফিগারেশন পাওয়া যায়নি",
      };
    }

    const isSandbox = process.env.NAGAD_SANDBOX === "true";
    const baseUrl = isSandbox
      ? "https://sandbox.mynagad.com/api/dfs"
      : "https://api.mynagad.com/api/dfs";

    // Get order details
    const order = await db.order.findUnique({
      where: { id: data.orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: "অর্ডার পাওয়া যায়নি" };
    }

    // Create payment
    const paymentResponse = await fetch(`${baseUrl}/check-out/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account: session.user.id,
        amount: data.amount,
        dateTime: new Date().toISOString(),
        orderId: order.orderNumber,
        merchantId,
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/nagad/callback?order_id=${data.orderId}`,
      }),
    });

    const paymentResult = await paymentResponse.json();

    if (paymentResult?.url) {
      // Create payment record
      const payment = await db.payment.create({
        data: {
          orderId: data.orderId,
          gateway: "NAGAD",
          sessionId: paymentResult.paymentId,
          amount: data.amount,
          status: "PENDING",
        },
      });

      return {
        success: true,
        paymentUrl: paymentResult.url,
        paymentId: payment.id,
        gateway: "NAGAD",
      };
    }

    return { success: false, error: "Nagad পেমেন্ট শুরু করতে ব্যর্থ" };
  } catch (error) {
    console.error("Nagad init error:", error);
    return { success: false, error: "Nagad পেমেন্ট শুরু করতে ব্যর্থ" };
  }
}

/**
 * Verify payment after callback
 * @param data - Payment verification data
 * @returns Verification result
 */
export async function verifyPayment(
  data: PaymentVerifyRequest
): Promise<PaymentVerifyResponse> {
  try {
    // Find payment record
    const payment = await db.payment.findFirst({
      where: {
        id: data.paymentId,
        orderId: data.orderId,
        gateway: data.gateway,
      },
    });

    if (!payment) {
      return { success: false, error: "পেমেন্ট রেকর্ড পাওয়া যায়নি" };
    }

    // Update payment status based on gateway verification
    // This would normally involve verifying with the payment gateway
    // For now, we'll assume success if the payment exists

    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        transactionId: `${data.gateway}_${Date.now()}`,
      },
    });

    // Update order status
    await db.order.update({
      where: { id: data.orderId },
      data: {
        status: "PROCESSING",
        paymentStatus: "PAID",
      },
    });

    return {
      success: true,
      transactionId: payment.transactionId || `${data.gateway}_${Date.now()}`,
    };
  } catch (error) {
    console.error("Payment verify error:", error);
    return { success: false, error: "পেমেন্ট যাচাই করতে ব্যর্থ" };
  }
}

/**
 * Cancel payment
 * @param data - Payment verification data
 * @returns Cancellation result
 */
export async function cancelPayment(
  data: PaymentVerifyRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    const payment = await db.payment.findFirst({
      where: {
        id: data.paymentId,
        orderId: data.orderId,
        gateway: data.gateway,
      },
    });

    if (!payment) {
      return { success: false, error: "পেমেন্ট রেকর্ড পাওয়া যায়নি" };
    }

    await db.payment.update({
      where: { id: payment.id },
      data: { status: "CANCELLED" },
    });

    return { success: true };
  } catch (error) {
    console.error("Payment cancel error:", error);
    return { success: false, error: "পেমেন্ট বাতিল করতে ব্যর্থ" };
  }
}
