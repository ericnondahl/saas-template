import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createUnsubscribeToken,
  createUnsubscribeUrl,
  verifyUnsubscribeToken,
} from "./unsubscribe.server";

const USER_ID = "clxyz123abc";

beforeEach(() => {
  process.env.UNSUBSCRIBE_SECRET = "test-secret";
});

afterEach(() => {
  delete process.env.UNSUBSCRIBE_SECRET;
});

describe("unsubscribe tokens", () => {
  it("round-trips a valid token back to the userId", () => {
    const token = createUnsubscribeToken(USER_ID);
    expect(verifyUnsubscribeToken(token)).toBe(USER_ID);
  });

  it("signs each user with a distinct signature", () => {
    const tokenA = createUnsubscribeToken("user-a");
    const tokenB = createUnsubscribeToken("user-b");
    expect(tokenA.split(".")[1]).not.toBe(tokenB.split(".")[1]);
  });

  it("rejects a token with a tampered userId", () => {
    const token = createUnsubscribeToken(USER_ID);
    const signature = token.slice(token.lastIndexOf(".") + 1);
    expect(verifyUnsubscribeToken(`other-user.${signature}`)).toBeNull();
  });

  it("rejects a token with a tampered signature", () => {
    const token = createUnsubscribeToken(USER_ID);
    expect(verifyUnsubscribeToken(`${USER_ID}.AAAA${token.slice(-4)}`)).toBeNull();
  });

  it("rejects malformed tokens", () => {
    expect(verifyUnsubscribeToken("")).toBeNull();
    expect(verifyUnsubscribeToken("no-separator")).toBeNull();
    expect(verifyUnsubscribeToken(".sig-only")).toBeNull();
    expect(verifyUnsubscribeToken(USER_ID)).toBeNull();
  });

  it("rejects tokens signed with a different secret", () => {
    const token = createUnsubscribeToken(USER_ID);
    process.env.UNSUBSCRIBE_SECRET = "rotated-secret";
    expect(verifyUnsubscribeToken(token)).toBeNull();
  });

  it("builds an unsubscribe URL containing the token", () => {
    const url = new URL(createUnsubscribeUrl("http://localhost:5173", USER_ID));
    expect(url.pathname).toBe("/unsubscribe");
    expect(verifyUnsubscribeToken(url.searchParams.get("token")!)).toBe(USER_ID);
  });
});
