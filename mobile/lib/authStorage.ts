import AsyncStorage from "@react-native-async-storage/async-storage";

// Set the first time a user successfully establishes a session on this device,
// and persists across sign-out and session expiry (only cleared on account
// deletion). Drives index.tsx routing: a signed-out user who has signed in
// before is a *returning* user — e.g. their Clerk session expired — and is
// sent straight to /sign-in, while a genuinely new install lands on /sign-up
// (or a /splash onboarding screen, once the app adds one).
export const SIGNED_IN_BEFORE_KEY = "signed_in_before_at";

export async function markSignedInBefore(): Promise<void> {
  try {
    await AsyncStorage.setItem(SIGNED_IN_BEFORE_KEY, new Date().toISOString());
  } catch {
    // ignore — worst case a returning user lands on /sign-up instead of /sign-in
  }
}

export async function hasSignedInBefore(): Promise<boolean> {
  try {
    return Boolean(await AsyncStorage.getItem(SIGNED_IN_BEFORE_KEY));
  } catch {
    return false;
  }
}

export async function clearSignedInBefore(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SIGNED_IN_BEFORE_KEY);
  } catch {
    // ignore
  }
}
