# Web Application

React Router 7 web application with server-side rendering.

## Features

- **React Router 7** with SSR
- **Clerk Authentication** for user management
- **Prisma** for database ORM
- **Redis** for caching
- **Tailwind CSS** for styling
- **TypeScript** for type safety

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run typecheck
```

## Project Structure

```
web/
├── app/
│   ├── routes/           # Application routes
│   ├── services/         # Service layer (auth, db, cache)
│   ├── root.tsx          # Root component
│   └── routes.ts         # Route configuration
├── public/               # Static assets
└── vite.config.ts        # Vite configuration
```

## Environment Variables

Create a `.env` file in the `web` directory:

```
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_dev
REDIS_URL=redis://localhost:6379
```
