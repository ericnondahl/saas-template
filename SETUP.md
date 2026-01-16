# Setup Guide

Complete setup instructions for the SaaS Template.

## Step-by-Step Setup

### 1. Environment Setup

#### Get Clerk API Keys

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your publishable key (starts with `pk_test_`)
4. Copy your secret key (starts with `sk_test_`)

#### Configure Environment Variables

Create `.env` files from the examples:

**Root `.env`:**
```bash
cp .env.example .env
```

Edit `.env` and add your Clerk keys:
```env
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_dev
REDIS_URL=redis://localhost:6379
```

**Web `.env`:**
```bash
cp web/.env.example web/.env
```

Edit `web/.env` with the same Clerk keys.

**Mobile `.env`:**
```bash
cp mobile/.env.example mobile/.env
```

Edit `mobile/.env` with your Clerk publishable key:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 2. Install Dependencies

Install all dependencies for the monorepo:

```bash
npm run install:all
```

This will install dependencies for:
- Root workspace
- Web app
- Mobile app
- Shared package

### 3. Start Docker Services

Start PostgreSQL and Redis:

```bash
npm run docker:up
```

Verify services are running:

```bash
docker ps
```

You should see `saas-postgres` and `saas-redis` containers.

### 4. Initialize Database

Generate Prisma client:

```bash
npm run db:generate
```

Run migrations to create database tables:

```bash
npm run db:migrate
```

When prompted for a migration name, you can use: `initial_setup`

### 5. Build Shared Package

Build the shared types package:

```bash
cd packages/shared
npm run build
cd ../..
```

### 6. Start Development Servers

#### Web Application

In one terminal:

```bash
npm run dev:web
```

Visit http://localhost:3000

#### Mobile Application

In another terminal:

```bash
npm run dev:mobile
```

Options to run the mobile app:

**Option 1: Expo Go (easier, but limited)**
- Download Expo Go on your phone
- Scan the QR code

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

## Verification

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

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

**Web (port 3000):**
```bash
# Find and kill process using port 3000
# On Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# On macOS/Linux:
lsof -ti:3000 | xargs kill
```

**PostgreSQL (port 5432):**
```bash
npm run docker:down
npm run docker:up
```

**Redis (port 6379):**
```bash
npm run docker:down
npm run docker:up
```

### Prisma Client Not Found

If you get "Prisma Client not found" error:

```bash
npm run db:generate
```

### Module Not Found: @saas-template/shared

Build the shared package:

```bash
cd packages/shared
npm run build
cd ../..
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

## Next Steps

1. **Customize Clerk Settings**
   - Add OAuth providers
   - Configure email templates
   - Set up webhooks

2. **Extend Database Schema**
   - Edit `prisma/schema.prisma`
   - Run `npm run db:migrate`

3. **Add New Routes**
   - Web: Create files in `web/app/routes/`
   - Mobile: Create files in `mobile/app/`

4. **Deploy Your App**
   - See deployment section in README.md

## Getting Help

- Check the main [README.md](./README.md)
- Review [Clerk Documentation](https://clerk.com/docs)
- Check [React Router Docs](https://reactrouter.com)
- Check [Expo Documentation](https://docs.expo.dev)
- Review [Prisma Documentation](https://www.prisma.io/docs)

---

If you encounter issues not covered here, please open an issue on GitHub.
