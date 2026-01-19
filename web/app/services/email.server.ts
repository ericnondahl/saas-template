import { Resend } from "resend";
import { render } from "@react-email/components";
import WelcomeEmail from "../emails/WelcomeEmail";

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

  const html = await render(
    WelcomeEmail({ firstName: firstName || undefined })
  );

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: email,
    subject: "Welcome to Our App!",
    html,
  });

  if (error) {
    throw error;
  }

  console.log(`📧 Welcome email sent to ${email}`);

  return data;
}
