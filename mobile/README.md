# Mobile Application

Expo React Native mobile application with custom native code support.

## Features

- **Expo Router** for file-based navigation
- **Clerk Authentication** for user management
- **Custom Native Code** support with dev client
- **Shared Types** from monorepo
- **TypeScript** for type safety

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS (requires macOS)
npm run ios

# Run on Android
npm run android

# Prebuild native projects
npm run prebuild

# Type check
npm run typecheck
```

## Project Structure

```
mobile/
├── app/
│   ├── (tabs)/          # Tab-based navigation
│   ├── _layout.tsx      # Root layout with Clerk provider
│   └── sign-in.tsx      # Sign in screen
├── components/          # Reusable components
├── constants/           # App constants
├── assets/              # Images and other assets
└── app.json             # Expo configuration
```

## Environment Variables

Create a `.env` file in the `mobile` directory:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

## Building for Production

```bash
# Create a development build
npx expo run:ios
npx expo run:android

# For production builds, use EAS Build
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

## Notes

- This template uses the Expo dev client which allows custom native code
- Native directories (`ios/` and `android/`) will be generated when you run `npx expo prebuild`
- The app uses Expo Router for type-safe navigation
