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
Copy-Item .env.example .env
Copy-Item web\.env.example web\.env
Copy-Item mobile\.env.example mobile\.env
```

### 3. Get Clerk API Keys

1. Go to [clerk.com](https://clerk.com) and sign up/sign in
2. Create a new application
3. Copy your Publishable Key (starts with `pk_test_`)
4. Copy your Secret Key (starts with `sk_test_`)

### 4. Update Environment Files

Edit `.env`, `web\.env`, and `mobile\.env` with your Clerk keys:

- Replace `pk_test_xxxxx` with your actual publishable key
- Replace `sk_test_xxxxx` with your actual secret key

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

## Testing

1. Open http://localhost:3000 in your browser
2. Click "Sign In" and create an account
3. You should see the dashboard
4. Open the mobile app and sign in with the same account

## All Commands in One Block

Copy and run these one by one:

```powershell
# Install
npm run install:all

# Environment (copy example files)
Copy-Item .env.example .env
Copy-Item web\.env.example web\.env  
Copy-Item mobile\.env.example mobile\.env

# STOP HERE: Edit the .env files with your Clerk keys!
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

## Troubleshooting

**"Port 3000 already in use":**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

**"Prisma Client not found":**
```powershell
npm run db:generate
```

**"Cannot find module '@saas-template/shared'":**
```powershell
cd packages\shared
npm run build
cd ..\..
```

**Docker not starting:**
- Make sure Docker Desktop is running
- Try: `npm run docker:down` then `npm run docker:up`

## Next Steps

- Check out [SETUP.md](./SETUP.md) for detailed setup instructions
- Read [README.md](./README.md) for full documentation
- Start building your features!

## Need Help?

- Check the [SETUP.md](./SETUP.md) for detailed troubleshooting
- Review the service layer in `web/app/services/`
- Look at example routes in `web/app/routes/`
- Check mobile screens in `mobile/app/`

---

**You're all set! Start building your SaaS! 🚀**
