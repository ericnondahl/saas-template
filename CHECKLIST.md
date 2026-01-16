# Setup Checklist

Use this checklist to ensure everything is set up correctly.

## Initial Setup

- [ ] Node.js 18+ installed
- [ ] Docker Desktop installed and running
- [ ] Git repository initialized
- [ ] Clerk account created at [clerk.com](https://clerk.com)

## Environment Configuration

- [ ] Copy `.env.example` to `.env` in root
- [ ] Copy `web\.env.example` to `web\.env`
- [ ] Copy `mobile\.env.example` to `mobile\.env`
- [ ] Added Clerk Publishable Key to all .env files
- [ ] Added Clerk Secret Key to root and web .env files
- [ ] Database URL configured (default: `postgresql://postgres:postgres@localhost:5432/saas_dev`)
- [ ] Redis URL configured (default: `redis://localhost:6379`)

## Dependencies

- [ ] Ran `npm run install:all` successfully
- [ ] All packages installed without errors

## Docker Services

- [ ] Ran `npm run docker:up`
- [ ] PostgreSQL container running (`docker ps` shows `saas-postgres`)
- [ ] Redis container running (`docker ps` shows `saas-redis`)

## Database

- [ ] Ran `npm run db:generate` (generates Prisma client)
- [ ] Ran `npm run db:migrate` (creates database tables)
- [ ] Migration completed successfully

## Shared Package

- [ ] Built shared package: `cd packages\shared && npm run build`
- [ ] No TypeScript errors in shared package

## Web Application

- [ ] Web app starts: `npm run dev:web`
- [ ] Can access http://localhost:3000
- [ ] Home page loads correctly
- [ ] Can click "Sign In" button
- [ ] Clerk authentication modal appears
- [ ] Can create an account
- [ ] Redirected to dashboard after sign-in
- [ ] Dashboard shows user information
- [ ] No console errors in browser

## Mobile Application

- [ ] Mobile app starts: `npm run dev:mobile`
- [ ] QR code appears in terminal
- [ ] Can scan QR with Expo Go app OR
- [ ] Can run on iOS simulator: `npm run ios` OR
- [ ] Can run on Android emulator: `npm run android`
- [ ] Home screen loads
- [ ] Can navigate between tabs
- [ ] Can sign in with Clerk
- [ ] Profile screen shows user info

## Type Checking

- [ ] Ran `npm run typecheck`
- [ ] No TypeScript errors in any package

## Database Tools

- [ ] Can open Prisma Studio: `npm run db:studio`
- [ ] Prisma Studio accessible at http://localhost:5555
- [ ] Can see User table

## Verification Tests

- [ ] Created account on web app
- [ ] User appears in Prisma Studio
- [ ] Can sign in on mobile with same account
- [ ] User data syncs between web and mobile

## Documentation Review

- [ ] Read [README.md](./README.md)
- [ ] Read [QUICKSTART.md](./QUICKSTART.md)
- [ ] Understand project structure
- [ ] Know where to add new routes
- [ ] Understand service layer pattern

## Optional: Development Setup

- [ ] IDE configured (VS Code recommended)
- [ ] Installed recommended extensions
- [ ] ESLint/Prettier configured (if desired)
- [ ] Git hooks set up (if desired)

## Troubleshooting

If any checkbox above fails, refer to:

- [QUICKSTART.md](./QUICKSTART.md) - Quick commands
- [SETUP.md](./SETUP.md) - Detailed setup with troubleshooting
- [README.md](./README.md) - Full documentation

## Common Issues

**Port conflicts:**
```powershell
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

**Docker not starting:**
```powershell
npm run docker:down
npm run docker:up
```

**Prisma errors:**
```powershell
npm run db:generate
```

**Module not found:**
```powershell
cd packages\shared
npm run build
cd ..\..
```

## Ready to Build?

Once all checkboxes are completed:

1. ✅ You're ready to start building features!
2. 📖 Review the service layer in `web/app/services/`
3. 🎨 Check example routes in `web/app/routes/`
4. 📱 Look at mobile screens in `mobile/app/`
5. 🗄️ Modify database schema in `prisma/schema.prisma`
6. 📦 Add shared types in `packages/shared/src/types/`

## Next Steps

- [ ] Remove example routes and customize
- [ ] Add your own database models
- [ ] Configure Clerk settings (OAuth providers, etc.)
- [ ] Customize UI design
- [ ] Add business logic
- [ ] Set up production deployment

---

**Happy building! 🚀**
