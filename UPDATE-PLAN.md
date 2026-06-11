# Template Update Plan — Ports from the `move` project

Improvements identified by reviewing `/Users/ericnondahl/move` (a production app built on an
earlier version of this template). Four work items, ordered so each builds on the previous.

Source references point into the `move` repo; copy and adapt rather than reinvent — these
patterns are battle-tested in production.

---

## 1. Vitest across all workspaces + real `check` gate

The template currently has no test framework. `move` runs Vitest in web, mobile, and shared,
orchestrated from the root.

### Changes

**New files** (copy from `move`, adjust aliases/package names):

| Template file                      | Source                                  | Notes                                                                                                                                             |
| ---------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `web/vitest.config.ts`             | `move/web/vitest.config.ts`             | Uses `vite-tsconfig-paths`; `include: ["app/**/*.test.ts"]`, node env                                                                             |
| `mobile/vitest.config.ts`          | `move/mobile/vitest.config.ts`          | Alias `@saas-template/shared` → `../packages/shared/src` (move uses `@cockpitmove/shared`); `include: ["utils/**/*.test.ts", "lib/**/*.test.ts"]` |
| `packages/shared/vitest.config.ts` | `move/packages/shared/vitest.config.ts` |                                                                                                                                                   |

**Dependencies:** add `vitest` (devDependency) to root, web, mobile, and shared. `move` is on
Vitest 4.x. Web also needs `vite-tsconfig-paths` if not already present (it is — used in
`web/vite.config.ts`).

**Script changes:**

- Root `package.json`:
  - `"test": "vitest run"` (replaces the current `cd web && npm run test`, which points at a
    script that doesn't exist)
  - `"test:watch": "vitest"`
  - `"check": "npm run format && npm run typecheck && npm run test && npm run build"`
    (current `check` runs `db:generate` first and skips tests/build; adopt move's full gate)
- `web/package.json`: add `"test": "vitest run"`, `"test:watch": "vitest"`
- `mobile/package.json`: add `"test": "vitest run"`, `"test:watch": "vitest"`
- `packages/shared/package.json`: add `"test": "vitest run"`, `"test:watch": "vitest"`

**Seed tests:** the auth-guard unit tests from item 2 become the first real test suite
(`mobile/lib/authGuard.test.ts`). Add one trivial test in shared (e.g. for an API-response
helper) so every workspace has a passing suite from day one.

### Acceptance

- `npm run test` at root runs all workspaces and passes.
- `npm run check` runs format → typecheck → test → build and passes clean.

---

## 2. Mobile auth-guard hardening (loop fix + returning-user routing)

Two small, self-contained modules from `move` that fix real production auth bugs.
Create `mobile/lib/` (doesn't exist in the template yet).

### 2a. `mobile/lib/authGuard.ts` — the redirect-loop fix

**Source:** `move/mobile/lib/authGuard.ts` (~90 lines, pure logic, heavily documented).

**The bug it fixes:** after `setActive()` on sign-in, Clerk's `useAuth()` context lags the
singleton by several render frames. A naive guard in the tabs layout reads stale
`isSignedIn === false`, redirects to `/sign-in`, whose "session restored" effect bounces back
to `/(tabs)` — an infinite loop until force-quit.

**The fix, three layers:**

1. `evaluateAuthGuard()` consults the Clerk singleton (`getClerkInstance().session`) alongside
   the React context value — the singleton updates synchronously on `setActive()`.
2. A post-mount grace window before redirecting (covers cold-start session restoration lag).
3. A module-scoped `sessionLatched` flag (`latchSignedIn()` / `unlatchSignedIn()` /
   `isSessionLatched()`) that survives layout remounts — needed because the loop _is_ remount
   churn, so per-component refs never accumulate state.

**Wiring (mirror move's usage):**

- `mobile/app/(tabs)/_layout.tsx`: replace any direct `isSignedIn` redirect with
  `evaluateAuthGuard({ isLoaded, isSignedIn, hasActiveSession, wasSignedIn, authSettled })`;
  render tabs / loading / `<Redirect href="/sign-in" />` from the decision. Call
  `latchSignedIn()` whenever a signed-in state is observed.
- `mobile/app/sign-in.tsx` (and sign-up): call `latchSignedIn()` immediately after
  `setActive()` succeeds in every flow (email, Google, Apple).
- Sign-out handler: call `unlatchSignedIn()` before `signOut()`.

**Tests:** port `evaluateAuthGuard` unit tests (pure function — table-driven tests over the
five boolean inputs; cover the lag window, latch, and genuine sign-out cases).

### 2b. `mobile/lib/authStorage.ts` — returning-user routing

**Source:** `move/mobile/lib/authStorage.ts` (~35 lines).

AsyncStorage marker `signed_in_before_at`, set on first successful session and persisted
across sign-out/session expiry. Routing rule: signed-out user who has signed in before goes
straight to `/sign-in` (their session expired); fresh install sees the splash/onboarding
entry screen.

- Dependency: `@react-native-async-storage/async-storage` (check if mobile already has it;
  add if not).
- Call `markSignedInBefore()` alongside `latchSignedIn()` after successful auth.
- The template has no splash screen route yet — wire the check into the index/entry redirect
  so the structure exists (`hasSignedInBefore() ? /sign-in : /sign-up` for now), and note in
  code that a `/splash` onboarding route can slot in later.

### Acceptance

- Sign in → land on tabs with no bounce; force-quit and relaunch → still on tabs.
- Sign out → land on `/sign-in` and stay there (latch cleared).
- `authGuard.test.ts` passes under `npm run test`.

---

## 3. Apple Sign-In (native, with name capture) + richer sync payload

The template's mobile auth offers Google SSO + email/password. Apple Sign-In is required by
App Store policy when other third-party logins are offered, so the template should ship it.

### 3a. Native Apple Sign-In

**Source:** `move/mobile/app/sign-in.tsx` `handleAppleSignIn` (lines ~293–375).

- **iOS — native flow** via `expo-apple-authentication` rather than Clerk's OAuth hook,
  because Apple provides `fullName` only in the native credential, only on first
  authorization, and Clerk's hook discards it:
  1. `AppleAuthentication.signInAsync()` with FULL_NAME + EMAIL scopes and a
     `Crypto.randomUUID()` nonce.
  2. Capture `givenName`/`familyName` from the credential.
  3. Exchange the identity token with Clerk: `signIn.create({ strategy: "oauth_token_apple", token: identityToken })`.
  4. Handle the transfer case: if `firstFactorVerification.status === "transferable"`, the
     user is new → `signUp.create({ transfer: true })` and use that session.
  5. `setActive()`, then sync the captured name to the server (3b), then redirect.
- **Android — OAuth fallback** via `startSSOFlow({ strategy: "oauth_apple", redirectUrl: Linking.createURL("oauth-callback") })`
  (no name available on this path; that's expected).

**New dependencies / config:**

- `expo-apple-authentication`, `expo-crypto`
- `app.json`: `"ios": { "usesAppleSignIn": true }` and add the plugin
- Clerk dashboard: enable Apple as a social connection (document in README/QUICKSTART)
- UI: Apple button on sign-in and sign-up screens (use
  `AppleAuthentication.AppleAuthenticationButton` on iOS per Apple HIG)

### 3b. Richer `/api/sync-user` payload

**Source:** move's sync flow (`move/mobile/...syncUserToDatabase` →
`move/web/app/routes/api.sync-user.ts` → `move/web/app/services/user.server.ts`).

- Mobile: extend the existing post-sign-in `POST /api/sync-user` call to send
  `{ firstName, lastName, timezone, platform, clientVersion }` — name fields populated only
  by the Apple native flow; timezone from `Intl.DateTimeFormat().resolvedOptions().timeZone`;
  platform/version from `expo-constants`.
- Server (`web/app/routes/api.sync-user.ts` + `web/app/services/user.server.ts`): accept the
  new fields; persist name only if not already set (don't clobber a Clerk-managed name with
  `undefined`); store timezone/platform/clientVersion on the User record.
- Prisma: add `timezone`, `platform`, `clientVersion` (all nullable `String?`) to `User`;
  one migration.

### Acceptance

- iOS simulator/device: Apple sign-in completes, first-ever authorization persists the name
  to the DB, subsequent sign-ins don't blank it.
- Google and email flows still pass timezone/platform/version through sync.
- Existing users sync without a migration backfill (new fields nullable).

---

## 4. EAS build pipeline + mobile dev convenience scripts

The template has no EAS configuration; every build requires hand-typed `eas` commands.

### 4a. `mobile/eas.json`

**Source:** `move/mobile/eas.json` — **copy the structure, NOT the values.** Move's file
contains real production keys inline; the template version must use placeholders or rely on
EAS env vars. Profiles to keep:

- `development` — dev client, internal distribution
- `preview` — internal distribution, real devices; `env` block with placeholder
  `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_POSTHOG_KEY`,
  `EXPO_PUBLIC_POSTHOG_HOST`
- `preview-dev` — `extends: preview` + `EXPO_PUBLIC_DEV_MODE=true`
- `production` — `autoIncrement: true`, same placeholder env block
- `submit.production.android.track: "internal"`
- Keep `cli.appVersionSource: "remote"`; drop move's pinned Xcode/SDK `image` values (they
  date quickly — let EAS defaults apply, note in a comment-equivalent README line that you
  can pin images when a native toolchain mismatch bites)

Document the placeholder-filling step in QUICKSTART.md.

### 4b. Root `package.json` scripts

```json
"dev:ios": "npm run ios --workspace=mobile",
"dev:android": "npm run android --workspace=mobile",
"dev:prebuild": "npm run prebuild --workspace=mobile",
"mobile:clean": "cd mobile && expo prebuild --clean",
"build:ios": "cd mobile && eas build --platform ios --profile production",
"build:android": "cd mobile && eas build --platform android --profile production",
"submit:ios": "cd mobile && eas build --platform ios --profile production --auto-submit",
"submit:android": "cd mobile && eas build --platform android --profile production --auto-submit",
"build:ios:local": "cd mobile && eas build --profile preview --local --platform ios",
"build:ios:local:dev": "cd mobile && eas build --profile preview-dev --local --platform ios",
"build:android:local": "cd mobile && eas build --profile preview --local --platform android",
"build:android:local:dev": "cd mobile && eas build --profile preview-dev --local --platform android"
```

### 4c. `mobile/package.json` scripts

```json
"ios:device": "REACT_NATIVE_PACKAGER_HOSTNAME=$(ipconfig getifaddr en0) expo run:ios --device",
"android:device": "REACT_NATIVE_PACKAGER_HOSTNAME=$(ipconfig getifaddr en0) expo run:android --device"
```

The hostname trick makes Metro reachable from a physical device over LAN without manually
looking up the Mac's IP. (macOS-only — fine for this template; note it in CONTRIBUTING.md.)

### 4d. Small script polish (ride-alongs)

- `db:studio`: add `--port 5050` (avoids colliding with other Prisma Studio instances)
- `format`: add `--log-level error` (quieter output)

### Acceptance

- `eas build --profile preview --local --platform ios` produces an installable build with
  placeholder env vars filled in.
- `npm run dev:ios` / `ios:device` work from a clean clone after `install:all`.
- No real keys/secrets committed in `eas.json`.

---

## Sequencing

1 → 2 → 3 → 4. Item 1 first because item 2 lands with its tests; 3 builds on 2's sign-in
wiring (latch calls in the Apple flow); 4 is independent but lowest risk last.

Each item should be its own commit (or PR) so they can be cherry-picked into downstream
projects independently.

## Explicitly out of scope (app-specific to `move`)

- RevenueCat / credits / premium-tier machinery
- Referral system and device-fingerprint claims
- AppsFlyer attribution, Mapbox, app-boot logging
- Sentry instrumentation (worth doing, but a separate decision — would add
  `NODE_OPTIONS='--import ./instrument.server.mjs'` to web dev/start scripts)
- Phone login flag (`EXPO_PUBLIC_ENABLE_PHONE_LOGIN`)
