import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Sends a welcome email to a new user.
 * If RESEND_API_KEY is not set, logs a message instead of sending.
 */
export async function sendWelcomeEmail(
  email: string,
  firstName?: string | null
) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.log(
      `📧 Email sending disabled (no RESEND_API_KEY). Would have sent welcome email to ${email}`
    );
    return null;
  }

  const name = firstName || "there";

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: email,
    subject: "Welcome to Our App!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome, ${name}!</h1>
        <p style="color: #666; font-size: 16px;">
          Thanks for signing up! We're excited to have you on board.
        </p>
        <p style="color: #666; font-size: 16px;">
          Get started by exploring the app and let us know if you have any questions.
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Best regards,<br/>
          The Team
        </p>
      </div>
    `,
  });

  if (error) {
    throw error;
  }

  console.log(`📧 Welcome email sent to ${email}`);

  return data;
}
