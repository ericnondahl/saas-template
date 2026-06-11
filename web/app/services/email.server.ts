import { Resend } from "resend";
import { render } from "@react-email/components";
import WelcomeEmail from "../emails/WelcomeEmail";
import { eq } from "drizzle-orm";
import { db } from "./db.server";
import { users } from "../db/schema";
import { createUnsubscribeUrl } from "./unsubscribe.server";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Sends a welcome email to a new user.
 * If RESEND_API_KEY is not set, logs a message instead of sending.
 * If user has unsubscribed, skips sending the email.
 */
export async function sendWelcomeEmail(email: string, firstName?: string | null) {
  // Check if user exists and is subscribed
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true, emailSubscribed: true },
  });

  if (user && !user.emailSubscribed) {
    console.log(`📧 Skipping welcome email to ${email} - user has unsubscribed`);
    return null;
  }

  if (!resend || !process.env.RESEND_API_KEY) {
    console.log(
      `📧 Email sending disabled (no RESEND_API_KEY). Would have sent welcome email to ${email}`
    );
    return null;
  }

  const appUrl = process.env.APP_URL || "http://localhost:3000";

  // Signed, single-purpose unsubscribe link — the raw email never appears in
  // the URL. Only possible when the recipient has a user record.
  const unsubscribeUrl = user ? createUnsubscribeUrl(appUrl, user.id) : undefined;

  const html = await render(
    WelcomeEmail({
      firstName: firstName || undefined,
      unsubscribeUrl,
    })
  );

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: email,
    subject: "Welcome to Our App!",
    html,
    // RFC 8058 one-click unsubscribe for mail clients that support it
    headers: unsubscribeUrl
      ? {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        }
      : undefined,
  });

  if (error) {
    throw error;
  }

  console.log(`📧 Welcome email sent to ${email}`);

  return data;
}
