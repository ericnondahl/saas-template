# SaaS Template

A production-ready full-stack SaaS template with React Router 7 (SSR), Expo React Native, Clerk authentication, Prisma ORM, and Redis caching.

## 🚀 Features

- **Monorepo Structure** - Organized with workspaces for web, mobile, and shared packages
- **React Router 7** - Modern web framework with server-side rendering
- **Expo React Native** - Cross-platform mobile app with custom native code support
- **Shared Types** - TypeScript types shared between web and mobile
- **Clerk Authentication** - Secure user authentication out of the box
- **Prisma ORM** - Type-safe database access
- **Redis Caching** - High-performance caching layer
- **Docker Compose** - Local development with PostgreSQL and Redis
- **Modular Service Layer** - Easy to swap providers (auth, db, cache)

## 📁 Project Structure

```
saas-template/
├── web/                      # React Router 7 web app
│   ├── app/
│   │   ├── routes/          # File-based routing
│   │   ├── services/        # Service layer (auth, db, cache)
│   │   └── root.tsx
│   └── package.json
├── mobile/                   # Expo React Native app
│   ├── app/                 # Expo Router
│   │   ├── (tabs)/         # Tab navigation
│   │   └── _layout.tsx
│   └── package.json
├── packages/
│   └── shared/              # Shared TypeScript types
│       └── src/types/
├── prisma/
│   └── schema.prisma        # Database schema
├── docker-compose.yml       # Local services
└── package.json             # Root workspace
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository** (or use this template)

```bash
git clone <your-repo-url>
cd saas-template
```

2. **Install dependencies**

```bash
npm run install:all
```

3. **Set up environment variables**

Copy the example env files and fill in your values:

```bash
# Web
cp web/.env.example web/.env

# Mobile
cp mobile/.env.example mobile/.env
```

Get your Clerk API keys from [clerk.com](https://clerk.com)

4. **Start Docker services**

```bash
npm run docker:up
```

This starts PostgreSQL and Redis containers.

5. **Initialize the database**

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

### Running the Apps

**Web Application:**

```bash
npm run dev:web
```

Visit http://localhost:3000

**Mobile Application:**

```bash
npm run dev:mobile
```

Then use the Expo Go app or run on a simulator:

```bash
# iOS (requires macOS)
cd mobile && npm run ios

# Android
cd mobile && npm run android
```

## 📝 Available Scripts

### Root Level

- `npm run install:all` - Install all dependencies
- `npm run build` - Build all apps
- `npm run dev:web` - Start web dev server
- `npm run dev:mobile` - Start mobile dev server
- `npm run typecheck` - Type check all packages
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services

### Web App (in `web/`)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Mobile App (in `mobile/`)

- `npm start` - Start Expo dev server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run prebuild` - Generate native code

### Shared Package (in `packages/shared/`)

- `npm run typecheck` - Type check shared code

Note: The shared package uses direct source imports (no build step required). Changes are immediately available in web and mobile apps.

## 🏗️ Architecture

### Service Layer

The web app uses a modular service layer in `web/app/services/`:

- **`auth.server.ts`** - Wraps Clerk authentication
  - `getCurrentUser()` - Get current user
  - `requireAuth()` - Require authentication
  - `getOrCreateUser()` - Sync Clerk user with database

- **`db.server.ts`** - Wraps Prisma client
  - Singleton pattern for connection pooling
  - Direct access to `db` instance

- **`cache.server.ts`** - Wraps Redis client
  - `cache.get()` - Get from cache
  - `cache.set()` - Set with optional TTL
  - `cache.del()` - Delete key

This abstraction makes it easy to swap providers if needed.

### Database Schema

See `prisma/schema.prisma` for the database schema. Example models:

- **User** - Synced with Clerk authentication

### Shared Types

TypeScript types in `packages/shared/src/types/` are shared between web and mobile apps using the **internal package pattern**:

- User types and DTOs
- API response structures
- Pagination types

Both apps import the TypeScript source directly via tsconfig path aliases - no build step required. Changes are immediately reflected across all apps.

## 🔐 Authentication

This template uses Clerk for authentication. Features:

- Email/password authentication
- OAuth providers (Google, GitHub, etc.)
- Session management
- User profile management
- Protected routes

The mobile app uses `@clerk/clerk-expo` with secure token storage.

## 🗄️ Database

PostgreSQL database with Prisma ORM:

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: destroys data)
npx prisma migrate reset

# Open Prisma Studio
npm run db:studio
```

**Note:** All Prisma commands automatically load environment variables from `web/.env`, so make sure that file has your `DATABASE_URL` configured.

## 📱 Mobile Development

The mobile app uses Expo with dev client for custom native code:

```bash
# Generate native projects
cd mobile
npx expo prebuild

# Run with custom native code
npm run ios
npm run android
```

For production builds, use [EAS Build](https://docs.expo.dev/build/introduction/).

## 🚢 Deployment

### Web App

Deploy to any Node.js hosting platform:

- Vercel
- Railway
- Render
- AWS
- Google Cloud

Make sure to:
1. Set environment variables
2. Run database migrations
3. Build the app with `npm run build`

### Mobile App

Use [EAS Build](https://docs.expo.dev/build/introduction/) for iOS and Android:

```bash
npm install -g eas-cli
eas build --platform all
eas submit --platform all
```

## 🧪 Type Checking

Run type checking across all packages:

```bash
npm run typecheck
```

## 📚 Documentation

- [React Router 7](https://reactrouter.com)
- [Expo Documentation](https://docs.expo.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Redis Documentation](https://redis.io/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built with amazing open-source projects:
- React Router 7
- Expo
- Clerk
- Prisma
- Redis
- Tailwind CSS
- TypeScript

---

**Happy coding! 🎉**
