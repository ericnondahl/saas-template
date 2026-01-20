# Deploying to Railway

This guide walks you through deploying the SaaS template to [Railway](https://railway.app) using their GitHub integration for automatic builds on push.

## Architecture

You'll deploy 4 services:

| Service      | Type            | Purpose                        |
| ------------ | --------------- | ------------------------------ |
| **postgres** | Railway Plugin  | Database                       |
| **redis**    | Railway Plugin  | Job queue backend              |
| **web**      | GitHub Deploy   | React Router web application   |
| **worker**   | GitHub Deploy   | BullMQ background job processor |

## Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project** → **Empty Project**
3. Name your project (e.g., `my-saas-app`)

## Step 2: Add Postgres Database

1. In your project, click **Add Service** → **Database** → **PostgreSQL**
2. Railway will provision a Postgres instance automatically
3. Click on the Postgres service to see connection details

## Step 3: Add Redis

1. Click **Add Service** → **Database** → **Redis**
2. Railway will provision a Redis instance automatically

## Step 4: Deploy Web Service

1. Click **Add Service** → **GitHub Repo**
2. Select your repository
3. Configure the service:
   - **Name**: `web`
   - **Root Directory**: `web`
   - **Build Command**: (leave default, uses Dockerfile)
   - **Start Command**: `npm run start`

### Web Service Settings

Click on the web service → **Settings** tab:

- **Watch Paths**: `web/**`, `prisma/**`, `packages/**`
- This ensures rebuilds only trigger when relevant files change

## Step 5: Deploy Worker Service

1. Click **Add Service** → **GitHub Repo**
2. Select the **same repository** again
3. Configure the service:
   - **Name**: `worker`
   - **Root Directory**: `web`
   - **Build Command**: (leave default, uses Dockerfile)
   - **Start Command**: `npm run worker`

### Worker Service Settings

Same watch paths as web: `web/**`, `prisma/**`, `packages/**`

## Step 6: Configure Environment Variables

Both **web** and **worker** services need the same environment variables. Railway lets you reference other services using `${{ServiceName.VARIABLE}}` syntax.

Click on each service → **Variables** tab and add:

### Database & Redis (use Railway references)

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

### Clerk Authentication

```
CLERK_PUBLISHABLE_KEY=pk_live_xxxx
CLERK_SECRET_KEY=sk_live_xxxx
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxx
```

Get these from [clerk.com](https://clerk.com) → Your App → API Keys.

### Email (Resend)

```
RESEND_API_KEY=re_xxxx
EMAIL_FROM=hello@yourdomain.com
```

Get your API key from [resend.com](https://resend.com).

### App URL

```
APP_URL=https://web-production-xxxx.up.railway.app
```

Use your Railway-provided domain or custom domain.

### AI (OpenRouter) - Optional

```
OPENROUTER_API_KEY=sk-or-xxxx
```

Get from [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys).

### Analytics (PostHog) - Optional

```
VITE_POSTHOG_KEY=phc_xxxx
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

Get from [posthog.com](https://posthog.com).

## Step 7: Run Database Migrations

After the first deploy, you need to run Prisma migrations.

### Option A: Railway CLI (Recommended)

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Link to your project: `railway link`
4. Run migrations against the web service:

```bash
railway run -s web npx prisma migrate deploy
```

### Option B: Railway Shell

1. Click on the **web** service
2. Go to **Settings** → **Railway Shell**
3. Run: `npx prisma migrate deploy`

## Step 8: Set Up Custom Domain (Optional)

1. Click on the **web** service
2. Go to **Settings** → **Networking** → **Public Networking**
3. Click **Generate Domain** for a Railway subdomain, or
4. Click **Custom Domain** to add your own domain

Update your `APP_URL` environment variable to match.

## Automatic Deployments

With GitHub integration, Railway automatically:

- Rebuilds on every push to your default branch
- Shows build logs in the Railway dashboard
- Rolls back if builds fail

To change the deploy branch, go to service **Settings** → **Source** → **Branch**.

## Monitoring

- **Logs**: Click any service → **Logs** tab
- **Metrics**: Click any service → **Metrics** tab (CPU, memory, network)
- **Build Logs**: Click any service → **Deployments** tab

## Cost Estimation

Railway uses usage-based pricing:

- **Postgres**: ~$5-10/month for small databases
- **Redis**: ~$5/month
- **Web + Worker**: ~$5-20/month depending on traffic

Check [railway.app/pricing](https://railway.app/pricing) for current rates.

## Troubleshooting

### Build fails with "Dockerfile not found"

Make sure **Root Directory** is set to `web` for both web and worker services.

### "Connection refused" to database

Ensure you're using the Railway reference variable `${{Postgres.DATABASE_URL}}` not a hardcoded URL.

### Worker not processing jobs

1. Check worker logs for errors
2. Verify `REDIS_URL` is set correctly
3. Ensure worker service is running (not crashed)

### Prisma migration fails

Run migrations manually via Railway CLI:

```bash
railway run -s web npx prisma migrate deploy
```

## Local Development with Railway

You can use Railway's Postgres/Redis for local development:

```bash
# Copy connection strings from Railway dashboard to your web/.env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

Or use the local Docker setup:

```bash
npm run docker:up
```
