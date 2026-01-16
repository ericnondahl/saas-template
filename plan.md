# SaaS Project Template

## Architecture Overview

```mermaid
graph TB
    subgraph monorepo [Monorepo Root]
        shared[packages/shared<br/>Types and Utilities]
        web[web/<br/>React Router 7 SSR]
        mobile[mobile/<br/>Expo React Native]
    end
    
    subgraph services [External Services]
        clerk[Clerk Auth]
        postgres[(Postgres)]
        redis[(Redis)]
    end
    
    web --> shared
    mobile --> shared
    web --> clerk
    web --> postgres
    web --> redis
    mobile --> clerk
```

## Folder Structure

```
saas-template/
├── web/                      # React Router 7 web app with SSR
│   ├── app/
│   │   ├── routes/           # File-based routing
│   │   ├── services/         # Modular service layer (auth, db, cache)
│   │   └── root.tsx
│   ├── vite.config.ts
│   └── package.json
├── mobile/                   # Expo React Native (dev client)
│   ├── app/                  # Expo Router
│   ├── ios/
│   ├── android/
│   └── package.json
├── packages/
│   └── shared/               # Shared types and utilities
│       ├── src/
│       │   └── types/
│       └── package.json
├── prisma/
│   └── schema.prisma         # Database schema
├── docker-compose.yml        # Postgres + Redis for local dev
├── .env.example              # Environment template
├── .gitattributes            # Cross-platform line endings
├── package.json              # Root package with workspace scripts
└── tsconfig.base.json        # Shared TypeScript config
```

## Key Implementation Details

### 1. Modular Service Layer
Create an abstraction layer in `web/app/services/` to make swapping providers easy:

- `auth.server.ts` - Wraps Clerk, exposes `getCurrentUser()`, `requireAuth()`
- `db.server.ts` - Wraps Prisma client export
- `cache.server.ts` - Wraps Redis client with `get()`, `set()`, `del()`

### 2. React Router 7 with SSR
- Use React Router 7 framework mode with Vite
- Server-side rendering enabled via `@react-router/node`
- Example API route at `routes/api.example.ts` using `loader`/`action`

### 3. Expo with Custom Native Code
- Use `npx create-expo-app` with dev client template
- Pre-generated `ios/` and `android/` folders for native modules
- Expo Router for navigation

### 4. Shared Package
- TypeScript types in `packages/shared/src/types/`
- Example: `User` type used by both web and mobile
- Compiled to JS with declarations

### 5. Database and Caching
- Prisma schema with example `User` and `Post` models
- Redis client for session/cache layer
- Both services run via Docker Compose locally

### 6. Environment Configuration

`.env.example` will include:
```
# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_dev

# Redis
REDIS_URL=redis://localhost:6379
```

### 7. Cross-Platform Setup
- `.gitattributes` with `* text=auto eol=lf` for consistent line endings
- `.editorconfig` for consistent formatting
- All scripts work on Windows/Mac/Linux

### 8. Root Scripts

```json
{
  "scripts": {
    "install:all": "npm install && npm install --prefix web && npm install --prefix mobile && npm install --prefix packages/shared",
    "build": "npm run build --prefix packages/shared && npm run build --prefix web",
    "dev:web": "npm run dev --prefix web",
    "dev:mobile": "npm run start --prefix mobile",
    "test": "npm run test --prefix web && npm run test --prefix packages/shared",
    "typecheck": "tsc --noEmit -p web && tsc --noEmit -p mobile && tsc --noEmit -p packages/shared",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  }
}
```

## Files to Create

| File | Purpose |
|------|---------|
| `package.json` | Root package with scripts |
| `tsconfig.base.json` | Shared TS config |
| `.gitattributes` | Line ending normalization |
| `.editorconfig` | Editor consistency |
| `.env.example` | Environment template |
| `docker-compose.yml` | Postgres + Redis |
| `prisma/schema.prisma` | Database schema |
| `packages/shared/*` | Shared types package |
| `web/*` | React Router 7 app |
| `mobile/*` | Expo React Native app |
