import { describe, it, expect } from "vitest";
import { evaluateAuthGuard } from "./authGuard";

describe("evaluateAuthGuard", () => {
  const baseInput = {
    isLoaded: true,
    isSignedIn: false,
    hasActiveSession: false,
    wasSignedIn: false,
    authSettled: false,
  };

  it("shows loading while Clerk is initializing", () => {
    expect(evaluateAuthGuard({ ...baseInput, isLoaded: false })).toBe("loading");
  });

  it("renders tabs when fully signed in", () => {
    expect(evaluateAuthGuard({ ...baseInput, isSignedIn: true, hasActiveSession: true })).toBe(
      "tabs"
    );
  });

  it("renders tabs when previously signed in but currently signed out (sign-out flicker)", () => {
    // The sign-out flow handles navigation; the layout shouldn't redirect here.
    expect(evaluateAuthGuard({ ...baseInput, wasSignedIn: true })).toBe("tabs");
  });

  it("waits during the grace period when genuinely signed out on first mount", () => {
    expect(evaluateAuthGuard(baseInput)).toBe("loading");
  });

  it("redirects to sign-in once the grace period has elapsed and user is genuinely signed out", () => {
    expect(evaluateAuthGuard({ ...baseInput, authSettled: true })).toBe("redirect-signin");
  });

  // Reproduces the post-OAuth-sign-in loop bug.
  //
  // Scenario: the user just signed in. The sign-in screen called setActive()
  // and navigated to /(tabs). The Clerk singleton has the new session, but
  // the React AuthContext hasn't re-rendered yet, so useAuth() returns
  // isSignedIn=false. With the *old* logic (isSignedIn only + 300ms grace),
  // the layout would redirect back to /sign-in, where a session-restored
  // effect would replace back to /(tabs), causing an infinite loop until
  // force-quit.
  //
  // The fix: also trust hasActiveSession from the singleton, which is
  // updated synchronously by setActive().
  it("does NOT redirect when isSignedIn is stale-false but the Clerk singleton has an active session", () => {
    expect(
      evaluateAuthGuard({
        isLoaded: true,
        isSignedIn: false, // <-- stale React context value
        hasActiveSession: true, // <-- singleton is up to date
        wasSignedIn: false,
        authSettled: true, // <-- even past the grace period, we still don't redirect
      })
    ).toBe("tabs");
  });

  it("does NOT redirect during the grace period when singleton has an active session", () => {
    // Earlier branch — even before authSettled flips, we should render tabs
    // so the user doesn't see a spinner flash.
    expect(
      evaluateAuthGuard({
        isLoaded: true,
        isSignedIn: false,
        hasActiveSession: true,
        wasSignedIn: false,
        authSettled: false,
      })
    ).toBe("tabs");
  });

  it("redirects when both signals agree the user is signed out", () => {
    // Both context AND singleton say no session — definitely signed out.
    expect(
      evaluateAuthGuard({
        isLoaded: true,
        isSignedIn: false,
        hasActiveSession: false,
        wasSignedIn: false,
        authSettled: true,
      })
    ).toBe("redirect-signin");
  });
});
