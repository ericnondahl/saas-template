# SaaS Template

A production-ready full-stack SaaS template with React Router 7 (SSR), Expo React Native, Clerk authentication, Prisma ORM, and Redis caching.

## 🚀 Features

- **Standalone Projects** - Separate web and mobile projects that reference a shared package — no root workspace. `cd` into `web/` or `mobile/` to work on each app
- **React Router 7** - Modern web framework with server-side rendering
- **Expo React Native** - Cross-platform mobile app with custom native code support
- **Shared Types** - TypeScript types shared between web and mobile
- **Clerk Authentication** - Secure user authentication out of the box
- **Prisma ORM** - Type-safe database access
- **Redis Caching** - High-performance caching layer
- **BullMQ Job Queues** - Background job processing with Redis-backed queues and admin monitoring
- **OpenRouter AI** - AI/LLM integration with 300+ models, usage tracking, and cost monitoring
- **Resend Email** - Email service for notifications using Resend API with unsubscribe
- **PostHog Analytics** - Product analytics and session recording for web and mobile
- **Admin Dashboard** - Built-in admin panel with user management and AI usage analytics
- **Docker Compose** - Local development with PostgreSQL and Redis
- **Modular Service Layer** - Easy to swap providers (auth, db, cache, email, AI)

## 📁 Project Structure

```
saas-template/
├── web/                      # React Router 7 web app (standalone project)
│   ├── app/
│   │   ├── routes/          # File-based routing
│   │   ├── services/        # Service layer (auth, db, cache)
│   │   └── root.tsx
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── mobile/                   # Expo React Native app (standalone project)
│   ├── app/                 # Expo Router
│   │   ├── (tabs)/         # Tab navigation
│   │   └── _layout.tsx
│   └── package.json         # depends on ../packages/shared via file:
├── packages/
│   └── shared/              # Shared TypeScript types (standalone project)
│       └── src/types/
├── docker-compose.yml       # Local services (Postgres + Redis)
└── tsconfig.base.json       # Shared TypeScript config
```

There is no root `package.json` — `web/`, `mobile/`, and `packages/shared/` are independent npm projects. `cd` into the one you're working on to install dependencies and run commands. Both apps reference the shared package directly: web via a tsconfig path alias, mobile via a `file:../packages/shared` dependency.

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

2. **Install dependencies** (each project is independent)

```bash
cd web && npm install && cd ..
cd mobile && npm install && cd ..
cd packages/shared && npm install && cd ../..
```

3. **Set up environment variables**

Copy the example env files and fill in your values:

```bash
# Web
cp web/.env.example web/.env

# Mobile
cp mobile/.env.example mobile/.env
```

**Clerk (required):**

1. Create an application at [clerk.com](https://clerk.com)
2. Copy the Publishable Key (`pk_test_...`) into both `web/.env` and `mobile/.env`
3. Copy the Secret Key (`sk_test_...`) into `web/.env`
4. For social login, enable **Google** and **Apple** under SSO connections.
   Apple Sign-In is required by App Store policy if you offer any other
   third-party login on iOS; the mobile app uses the native Apple flow so the
   user's name is captured on first authorization (Clerk's dev keys work out
   of the box — production needs an Apple Services ID configured in Clerk)

**Optional services** (add the keys to `web/.env` unless noted):

- Resend (emails): `RESEND_API_KEY=re_...` from [resend.com](https://resend.com)
- OpenRouter (AI): `OPENROUTER_API_KEY=sk-or-...` from [openrouter.ai](https://openrouter.ai)
- PostHog (analytics): `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` in `web/.env`,
  `EXPO_PUBLIC_POSTHOG_KEY` / `EXPO_PUBLIC_POSTHOG_HOST` in `mobile/.env`,
  from [posthog.com](https://posthog.com)

4. **Start Docker services** (from the repo root)

```bash
docker compose up -d
```

This starts PostgreSQL and Redis containers (`saas-postgres` and `saas-redis`).

5. **Initialize the database**

```bash
cd web

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

### Running the Apps

**Web Application:**

```bash
cd web && npm run dev
```

Visit http://localhost:3000

**Mobile Application:**

```bash
cd mobile && npm start
```

Then use the Expo Go app or run on a simulator:

```bash
# iOS (requires macOS)
cd mobile && npm run ios

# Android
cd mobile && npm run android
```

## 📝 Available Scripts

There are no root-level scripts — run commands from the project you're working on.

### Web App (in `web/`)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run worker` - Start BullMQ job worker
- `npm run typecheck` - Type check
- `npm run test` - Run tests
- `npm run check` - Format + typecheck + test + build
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run email:dev` - Preview email templates

### Mobile App (in `mobile/`)

- `npm start` - Start Expo dev server
- `npm run ios` / `npm run android` - Run on simulator/emulator
- `npm run ios:device` / `npm run android:device` - Run on a physical device over Wi-Fi (macOS only)
- `npm run prebuild` - Generate native code
- `npm run typecheck` - Type check
- `npm run test` - Run tests
- `npm run check` - Format + typecheck + test
- `npm run build:ios` / `npm run build:android` - Production builds on EAS
- `npm run submit:ios` / `npm run submit:android` - Build + auto-submit to the stores
- `npm run build:ios:local` / `npm run build:android:local` - Internal-distribution builds on your machine (`:dev` variants set `EXPO_PUBLIC_DEV_MODE=true`)

### Shared Package (in `packages/shared/`)

- `npm run typecheck` - Type check shared code
- `npm run test` - Run tests
- `npm run check` - Format + typecheck + test

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

- **`email.server.ts`** - Wraps Resend email service
  - `sendEmail()` - Send transactional emails
  - Template support for welcome emails, notifications, etc.

- **`ai.server.ts`** - Wraps OpenRouter AI service
  - `openrouter<T>()` - Call AI models with typed responses
  - Automatic usage and cost tracking
  - Redis-cached model pricing (24h TTL)
  - Support for structured JSON outputs via JSON schema
  - All calls logged to database for analytics

- **`jobs/`** - BullMQ job queue infrastructure
  - `queues.ts` - Queue definitions and registry
  - `worker.ts` - Worker management (`startWorkers()`, `stopWorkers()`)
  - `processors/` - Job processor functions
  - Flexible deployment: run inline with web server or as separate process

This abstraction makes it easy to swap providers if needed.

### Analytics

PostHog is integrated for product analytics and session recording on both web and mobile:

- **Web**: Automatic pageview tracking, user identification via Clerk, and session replay
- **Mobile**: Event tracking, user identification, and mobile session replay
- **Privacy**: Password inputs are masked by default in session recordings
- **Custom Events**: Track custom events with `posthog.capture()` (web) or `usePostHog().capture()` (mobile)

Both platforms automatically identify users when signed in via Clerk.

### Admin Panel

The template includes a built-in admin panel at `/admin` with:

- **User Management** - View all users and manage admin privileges
- **API Logs** - View recent OpenRouter API calls with full request/response details
- **Usage Dashboard** - Monitor AI usage and costs over time with charts
  - Total cost, calls, and tokens
  - Daily usage trends
  - Per-model breakdown
- **Queue Monitor** - Monitor BullMQ job queues
  - Queue summary with job counts by status
  - Job details with data, timestamps, and error info
  - Filter by queue and job status

To grant yourself admin access: open Prisma Studio (`cd web && npm run db:studio`), find your user in the User table, and set `isAdmin: true`.

### Database Schema

See `web/prisma/schema.prisma` for the database schema. Example models:

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

PostgreSQL database with Prisma ORM. The schema and migrations live in `web/prisma/`, and all Prisma commands run from `web/`:

```bash
cd web

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: destroys data)
npx prisma migrate reset

# Open Prisma Studio
npm run db:studio
```

**Note:** The Prisma CLI automatically loads environment variables from `web/.env`, so make sure that file has your `DATABASE_URL` configured.

## 📋 Job Queues

The template includes BullMQ for background job processing with Redis:

### Running the Worker

**Standalone mode (recommended for production):**

```bash
cd web && npm run worker
```

**Inline mode (for development or single-service deployment):**

Set `RUN_WORKER=true` environment variable to start the worker with the web server:

```bash
cd web && RUN_WORKER=true npm run dev
```

To exercise the queue end to end: `cd web && npx tsx scripts/test-queue.ts` queues test jobs for all users, then start the worker to process them and watch them in the admin panel at `/admin/queues`.

### Creating Jobs

```typescript
import { testQueue } from "~/jobs";

// Add a job to the queue
await testQueue.add("job-name", {
  userId: "user-123",
  email: "user@example.com",
});
```

### Adding New Queues

1. Define the queue in `web/app/jobs/queues.ts`
2. Create a processor in `web/app/jobs/processors/`
3. Register the worker in `web/app/jobs/worker.ts`
4. Add the queue to `allQueues` array for admin monitoring

### Deployment Options

- **Same service:** Set `RUN_WORKER=true` to run worker inline with web server
- **Separate service:** Run `npm run worker` (from `web/`) as a dedicated service (recommended for scale)

Both options use the same Redis instance configured via `REDIS_URL`.

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
3. Build the app with `cd web && npm run build`

See [RAILWAY.md](./RAILWAY.md) for a step-by-step Railway deployment guide.

### Mobile App

Use [EAS Build](https://docs.expo.dev/build/introduction/) for iOS and Android:

1. Install the EAS CLI: `npm install -g eas-cli`, then `eas login`
2. Run `eas init` in `mobile/` to link the app to your Expo project
3. Fill in the placeholder env values in `mobile/eas.json` (`preview` and
   `production` profiles): your production API URL, Clerk publishable key,
   and PostHog key. These are baked into the binary at build time
4. Build from `mobile/`:
   - `npm run build:ios` / `npm run build:android` — production builds on EAS
   - `npm run submit:ios` / `npm run submit:android` — build + auto-submit to the stores
   - `npm run build:ios:local` / `npm run build:android:local` — internal-distribution
     builds on your own machine (`:dev` variants set `EXPO_PUBLIC_DEV_MODE=true`)
5. If a cloud build hits a native toolchain mismatch, you can pin a builder
   image per profile with the `image` field (see the [EAS docs](https://docs.expo.dev/build-reference/infrastructure/))

## 🧪 Checks & Tests

Each project has its own gate — run it in the project you changed:

```bash
cd web && npm run check              # format + typecheck + test + build
cd mobile && npm run check           # format + typecheck + test
cd packages/shared && npm run check  # format + typecheck + test
```

Handy test scripts for the optional services (run from `web/`):

- `npx tsx scripts/test-welcome-email.ts` — send a test email via Resend
- `npx tsx scripts/test-openrouter.ts` — exercise the OpenRouter AI service
- `npx tsx scripts/test-queue.ts` — queue test jobs for BullMQ

## 🔧 Troubleshooting

**Port already in use:** kill the process (`lsof -ti:3000 | xargs kill`) or restart the Docker services (`docker compose down && docker compose up -d` from the repo root).

**"Prisma Client not found":** run `cd web && npm run db:generate`.

**"Module not found: @saas-template/shared":** make sure dependencies are installed in the project that errors (`npm install` in `web/` or `mobile/`), then restart your IDE's TypeScript server. Web resolves the package via a tsconfig path alias; mobile via a `file:../packages/shared` dependency.

**Reset Docker volumes** (destroys local data):

```bash
docker compose down
docker volume rm saas-template_postgres_data saas-template_redis_data
docker compose up -d
```

## 📚 Documentation

- [React Router 7](https://reactrouter.com)
- [Expo Documentation](https://docs.expo.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Redis Documentation](https://redis.io/docs)
- [BullMQ Documentation](https://docs.bullmq.io)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Resend Documentation](https://resend.com/docs)
- [PostHog Documentation](https://posthog.com/docs)

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
- BullMQ
- OpenRouter
- Resend
- PostHog
- Recharts
- Tailwind CSS
- TypeScript

---

**Happy coding! 🎉**
