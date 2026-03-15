import { Resend } from "resend";

// Lazy initialization to avoid issues if API key is missing
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface SendPasswordResetEmailParams {
  email: string;
  resetLink: string;
}

export async function sendPasswordResetEmail({
  email,
  resetLink,
}: SendPasswordResetEmailParams) {
  // In development without a verified domain, log the reset link
  if (process.env.NODE_ENV === "development") {
    console.log("\n========================================");
    console.log("📧 PASSWORD RESET EMAIL (DEV MODE)");
    console.log("========================================");
    console.log(`To: ${email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log("========================================\n");
  }

  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: email,
    subject: "Reset Your Password - PetBazaar",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f9f9f9; border-radius: 10px; padding: 30px; margin-top: 20px;">
            <h1 style="color: #f97316; margin-bottom: 20px;">Password Reset Request</h1>
            <p style="margin-bottom: 20px;">Hello,</p>
            <p style="margin-bottom: 20px;">We received a request to reset your password for your PetBazaar account. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            <p style="margin-bottom: 20px; color: #666; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
            <p style="margin-bottom: 20px;">If you did not request a password reset, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #888; font-size: 12px;">If the button above doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #888; font-size: 12px; word-break: break-all;">${resetLink}</p>
          </div>
          <p style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
            PetBazaar - Your trusted pet marketplace
          </p>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Failed to send email");
  }

  return data;
}

interface SendOrderConfirmationEmailParams {
  to: string;
  orderNumber: string;
  customerName: string;
  total: number;
}

export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  customerName,
  total,
}: SendOrderConfirmationEmailParams) {
  if (process.env.NODE_ENV === "development") {
    console.log("\n========================================");
    console.log("📧 ORDER CONFIRMATION EMAIL (DEV MODE)");
    console.log("========================================");
    console.log(`To: ${to}`);
    console.log(`Order Number: ${orderNumber}`);
    console.log(`Total: ৳${total}`);
    console.log("========================================\n");
  }

  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to,
    subject: `Order Confirmed - PetBazaar (${orderNumber})`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f9f9f9; border-radius: 10px; padding: 30px; margin-top: 20px;">
            <h1 style="color: #f97316; margin-bottom: 20px;">Order Confirmed!</h1>
            <p style="margin-bottom: 20px;">Dear ${customerName},</p>
            <p style="margin-bottom: 20px;">Thank you for your order! We're pleased to confirm that we've received your order and it's being processed.</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Order Number</p>
              <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">${orderNumber}</p>

              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Total Amount</p>
              <p style="margin: 0; font-size: 24px; color: #f97316; font-weight: bold;">৳${total.toLocaleString()}</p>
            </div>

            <p style="margin-bottom: 20px;">You can track your order status at any time by visiting our website and entering your order number.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/track-order" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Track Order</a>
            </div>

            <p style="margin-bottom: 10px; color: #666; font-size: 14px;">Estimated Delivery: 7 business days</p>
            <p style="margin-bottom: 20px; color: #666; font-size: 14px;">Free delivery on all orders</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #888; font-size: 12px;">If you have any questions, please contact our customer support.</p>
          </div>
          <p style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
            PetBazaar - Your trusted pet marketplace
          </p>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send order confirmation email:", error);
    throw new Error("Failed to send email");
  }

  return data;
}

interface SendOrderStatusEmailParams {
  to: string;
  orderNumber: string;
  status: string;
  customerName: string;
}

export async function sendOrderStatusEmail({
  to,
  orderNumber,
  status,
  customerName,
}: SendOrderStatusEmailParams) {
  if (process.env.NODE_ENV === "development") {
    console.log("\n========================================");
    console.log("📧 ORDER STATUS EMAIL (DEV MODE)");
    console.log("========================================");
    console.log(`To: ${to}`);
    console.log(`Order Number: ${orderNumber}`);
    console.log(`Status: ${status}`);
    console.log("========================================\n");
  }

  const statusMessages: Record<string, string> = {
    CONFIRMED: "Your order has been confirmed and is being prepared for shipping.",
    PROCESSING: "Your order is being processed and will be shipped soon.",
    SHIPPED: "Your order has been shipped and is on its way to you!",
    DELIVERED: "Your order has been delivered. Thank you for shopping with us!",
    CANCELLED: "Your order has been cancelled as requested.",
  };

  const message = statusMessages[status] || `Your order status has been updated to: ${status}`;

  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to,
    subject: `Order Update - PetBazaar (${orderNumber})`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f9f9f9; border-radius: 10px; padding: 30px; margin-top: 20px;">
            <h1 style="color: #f97316; margin-bottom: 20px;">Order Status Update</h1>
            <p style="margin-bottom: 20px;">Dear ${customerName},</p>
            <p style="margin-bottom: 20px;">${message}</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Order Number</p>
              <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">${orderNumber}</p>

              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Current Status</p>
              <p style="margin: 0; font-size: 18px; color: #f97316; font-weight: bold;">${status}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/track-order" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Track Order</a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #888; font-size: 12px;">If you have any questions, please contact our customer support.</p>
          </div>
          <p style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
            PetBazaar - Your trusted pet marketplace
          </p>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send order status email:", error);
    throw new Error("Failed to send email");
  }

  return data;
}
