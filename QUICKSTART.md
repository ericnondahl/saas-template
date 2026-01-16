# Quick Start Guide

Get your SaaS template up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Docker Desktop running
- A Clerk account (free at [clerk.com](https://clerk.com))

## Quick Setup Commands

### 1. Install Dependencies

```powershell
npm run install:all
```

### 2. Set Up Environment Files

Copy the example environment files:

```powershell
Copy-Item web\.env.example web\.env
Copy-Item mobile\.env.example mobile\.env
```

### 3. Get Clerk API Keys

1. Go to [clerk.com](https://clerk.com) and sign up/sign in
2. Create a new application
3. Copy your Publishable Key (starts with `pk_test_`)
4. Copy your Secret Key (starts with `sk_test_`)

### 4. Update Environment Files

Edit `web\.env` and `mobile\.env` with your Clerk keys:

- Replace `pk_test_xxxxx` with your actual publishable key in both files
- Replace `sk_test_xxxxx` with your actual secret key in `web\.env`

### 5. Start Docker Services

```powershell
npm run docker:up
```

### 6. Initialize Database

```powershell
npm run db:generate
npm run db:migrate
```

When prompted for migration name: `initial_setup`

### 7. Build Shared Package

```powershell
cd packages\shared
npm run build
cd ..\..
```

### 8. Start Development

**Web App:**
```powershell
npm run dev:web
```

Visit: http://localhost:3000

**Mobile App (in a new terminal):**
```powershell
npm run dev:mobile
```

## All Commands in One Block

Copy and run these one by one:

```powershell
# Install
npm run install:all

# Environment (copy example files)
Copy-Item web\.env.example web\.env  
Copy-Item mobile\.env.example mobile\.env

# STOP HERE: Edit web/.env and mobile/.env with your Clerk keys!
# Get keys from https://clerk.com

# Start services
npm run docker:up

# Database
npm run db:generate
npm run db:migrate

# Build shared package
cd packages\shared
npm run build
cd ..\..

# Start web
npm run dev:web
```

In a new terminal:
```powershell
# Start mobile
npm run dev:mobile
```

---

## Detailed Setup Instructions

### Environment Configuration

#### Web `.env` File

Your `web\.env` should contain:

```env
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_dev
REDIS_URL=redis://localhost:6379
```

#### Mobile `.env` File

Your `mobile\.env` should contain:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Note:** Prisma commands run from the root will automatically use `web/.env` for database connection.

### Dependencies Installation

The `npm run install:all` command installs dependencies for:
- Root workspace
- Web app
- Mobile app
- Shared package

### Docker Services

Verify Docker services are running:

```bash
docker ps
```

You should see `saas-postgres` and `saas-redis` containers.

### Mobile App Options

**Option 1: Expo Go (easier, but limited)**
- Download Expo Go on your phone
- Scan the QR code from the terminal

**Option 2: iOS Simulator (macOS only)**
```bash
cd mobile
npm run ios
```

**Option 3: Android Emulator**
```bash
cd mobile
npm run android
```

---

## Verification & Testing

### Test Web App

1. Go to http://localhost:3000
2. Click "Sign In" or "Get Started"
3. Create an account with Clerk
4. You should be redirected to the dashboard

### Test Mobile App

1. Launch the mobile app
2. Tap "Sign In"
3. Sign in with the same Clerk account
4. Navigate between Home and Profile tabs

### Test Database

Open Prisma Studio to view your data:

```bash
npm run db:studio
```

Visit http://localhost:5555

### Test Redis

Connect to Redis CLI:

```bash
docker exec -it saas-redis redis-cli
```

Test commands:
```redis
PING
# Should return PONG

KEYS *
# Shows all keys (may be empty initially)

exit
```

---

## Troubleshooting

### Port Already in Use

**Web (port 3000):**
```powershell
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# macOS/Linux:
lsof -ti:3000 | xargs kill
```

**PostgreSQL (port 5432) or Redis (port 6379):**
```powershell
npm run docker:down
npm run docker:up
```

### Prisma Client Not Found

If you get "Prisma Client not found" error:

```powershell
npm run db:generate
```

### Module Not Found: @saas-template/shared

Build the shared package:

```powershell
cd packages\shared
npm run build
cd ..\..
```

### Clerk Authentication Issues

1. Verify your `.env` files have the correct Clerk keys
2. Make sure you're using keys from the same Clerk application
3. Check that keys start with:
   - `pk_test_` for publishable key
   - `sk_test_` for secret key

### Docker Issues

**On Windows:**
- Make sure Docker Desktop is running
- Enable WSL 2 backend in Docker Desktop settings

**Permission Issues:**
```bash
# Reset Docker volumes
npm run docker:down
docker volume rm saas-template_postgres_data saas-template_redis_data
npm run docker:up
```

### TypeScript Errors

Run type checking to see all errors:

```bash
npm run typecheck
```

Common fixes:
- Rebuild shared package: `cd packages/shared && npm run build`
- Clear cache: Delete `node_modules` and reinstall
- Restart TypeScript server in your IDE

---

## Next Steps

1. **Customize Clerk Settings**
   - Add OAuth providers (Google, GitHub, etc.)
   - Configure email templates
   - Set up webhooks

2. **Extend Database Schema**
   - Edit `prisma/schema.prisma`
   - Run `npm run db:migrate` to create migrations

3. **Add New Features**
   - Web routes: Create files in `web/app/routes/`
   - Mobile screens: Create files in `mobile/app/`
   - Shared types: Add to `packages/shared/src/types/`

4. **Deploy Your App**
   - See deployment section in README.md

---

## Getting Help

- **Documentation:** Check the main [README.md](./README.md)
- **Service Layer:** Review `web/app/services/` for backend utilities
- **Example Routes:** Look at `web/app/routes/` for patterns
- **Mobile Screens:** Check `mobile/app/` for navigation and screens
- **External Docs:**
  - [Clerk Documentation](https://clerk.com/docs)
  - [React Router Docs](https://reactrouter.com)
  - [Expo Documentation](https://docs.expo.dev)
  - [Prisma Documentation](https://www.prisma.io/docs)

---

**You're all set! Start building your SaaS! 🚀**
