/**
 * Pure auth-guard decision logic for (tabs)/_layout.tsx.
 *
 * Background — the loop bug: After OAuth/email sign-in, Clerk's
 * `setActive()` updates the singleton session synchronously, but the
 * `useAuth()` context value (driven by a `setState` inside a Clerk
 * listener) can lag by several render frames. If the destination screen
 * mounts during that window, useAuth().isSignedIn reads stale `false`,
 * and a too-short grace period redirects the user back to /sign-in.
 * /sign-in's "session restored" useEffect then bounces them right back
 * to /(tabs), creating an infinite loop until the app is force-quit.
 *
 * The fix: ALSO consult the Clerk singleton (`getClerkInstance().session`)
 * as an authoritative non-React signal. The singleton is updated by
 * setActive() before the React listener fires, so reading it during
 * render gives a current view that doesn't depend on context propagation.
 */

export type AuthGuardInput = {
  /** From useAuth(). Whether Clerk has finished initializing. */
  isLoaded: boolean;
  /** From useAuth(). The React-context view of sign-in state (can be stale). */
  isSignedIn: boolean;
  /** From getClerkInstance().session — true when Clerk's singleton has an active session. */
  hasActiveSession: boolean;
  /** Component-local ref: was the user ever observed as signed in during this layout's lifetime. */
  wasSignedIn: boolean;
  /** Component-local state: has the post-mount grace period elapsed. */
  authSettled: boolean;
};

export type AuthGuardDecision = "tabs" | "loading" | "redirect-signin";

export function evaluateAuthGuard(input: AuthGuardInput): AuthGuardDecision {
  const { isLoaded, isSignedIn, hasActiveSession, wasSignedIn, authSettled } = input;

  if (!isLoaded) return "loading";

  // Authoritative signed-in: trust either signal.
  // - isSignedIn: React context value (lags after setActive)
  // - hasActiveSession: Clerk singleton (synchronous)
  // - wasSignedIn: protects against transient flicker after we've already rendered tabs
  if (isSignedIn || hasActiveSession || wasSignedIn) return "tabs";

  // Genuinely signed out and never have been here. Wait briefly for the
  // grace window before redirecting — this catches first-render lag from
  // legitimate cold-start session restoration.
  if (!authSettled) return "loading";

  return "redirect-signin";
}

/**
 * Process-lifetime "a session was established this run" latch.
 *
 * Why this exists — the loop's last mile: `wasSignedIn` in (tabs)/_layout.tsx
 * is a per-component ref, so it resets every time the layout remounts. But the
 * loop *is* a remount churn (/(tabs) → /sign-in → /(tabs) → …), so that ref
 * never accumulates the fact that the user already signed in. Meanwhile the
 * auth signal isn't monotonic: after setActive(), clerk-expo reloads resources
 * from the network and can briefly report no session (both useAuth().isSignedIn
 * AND getClerkInstance().session read false for a few frames). A per-mount guard
 * acting on that transient false bounces an already-authenticated user.
 *
 * This latch lives at module scope, so it survives remounts. It's set the
 * moment any auth flow establishes a session (and whenever the layout observes
 * a signed-in state), and cleared only on an explicit sign-out. Once set, the
 * tabs guard treats the user as signed in regardless of a transient false read,
 * which is what breaks the loop. It resets naturally on a cold start (new JS
 * process), where session restoration is reliable and there's no nav churn.
 */
let sessionLatched = false;

/** Mark that a session has been established in this app run. */
export function latchSignedIn(): void {
  sessionLatched = true;
}

/** Clear the latch on explicit sign-out so /sign-in sticks. */
export function unlatchSignedIn(): void {
  sessionLatched = false;
}

/** Whether a session has been established (and not since signed out) this run. */
export function isSessionLatched(): boolean {
  return sessionLatched;
}
