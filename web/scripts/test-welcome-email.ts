/**
 * Test script to send a welcome email to a specified email address.
 * Usage: npx tsx scripts/test-welcome-email.ts <email>
 */
import "dotenv/config";
import { sendWelcomeEmail } from "../app/services/email.server";

const email = process.argv[2];
const firstName = process.argv[3];

if (!email) {
  console.error("Usage: npx tsx scripts/test-welcome-email.ts <email> [firstName]");
  console.error("\nExample:");
  console.error("  npx tsx scripts/test-welcome-email.ts test@example.com");
  console.error("  npx tsx scripts/test-welcome-email.ts test@example.com John");
  process.exit(1);
}

console.log(`Sending welcome email to ${email}...`);

try {
  await sendWelcomeEmail(email, firstName);
  console.log(`✓ Welcome email successfully sent to ${email}`);
} catch (error) {
  console.error("✗ Failed to send welcome email:");
  console.error(error);
  process.exit(1);
}
