import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: email,
    subject: "Reset Your Password - MeowBazaar",
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
            <p style="margin-bottom: 20px;">We received a request to reset your password for your MeowBazaar account. Click the button below to create a new password:</p>
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
            MeowBazaar - Your trusted pet marketplace
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
