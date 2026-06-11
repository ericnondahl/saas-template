import { createHmac, timingSafeEqual } from "node:crypto";

const PURPOSE = "unsubscribe";

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET || process.env.CLERK_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "Set UNSUBSCRIBE_SECRET (or CLERK_SECRET_KEY) to sign unsubscribe tokens"
    );
  }
  return secret;
}

function sign(userId: string): string {
  return createHmac("sha256", getSecret()).update(`${PURPOSE}:${userId}`).digest("base64url");
}

/**
 * Creates an opaque, single-purpose unsubscribe token for a user.
 * Format: `<userId>.<HMAC-SHA256(purpose:userId)>` — no email address in the URL.
 */
export function createUnsubscribeToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

/**
 * Verifies an unsubscribe token and returns the userId it was issued for,
 * or null if the token is malformed or the signature doesn't match.
 */
export function verifyUnsubscribeToken(token: string): string | null {
  const separator = token.lastIndexOf(".");
  if (separator <= 0) {
    return null;
  }

  const userId = token.slice(0, separator);
  const signature = Buffer.from(token.slice(separator + 1));
  const expected = Buffer.from(sign(userId));

  if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) {
    return null;
  }

  return userId;
}

export function createUnsubscribeUrl(appUrl: string, userId: string): string {
  return `${appUrl}/unsubscribe?token=${encodeURIComponent(createUnsubscribeToken(userId))}`;
}
