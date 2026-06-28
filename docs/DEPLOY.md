# Deployment Guide

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  USER BROWSER                                               │
│                                                             │
│  ┌──────────────────────────────┐                          │
│  │  Netlify (FREE)              │                          │
│  │  life-tracker.netlify.app    │◄── all frontend traffic  │
│  │                              │                          │
│  │  /              → host shell │                          │
│  │  /remotes/auth/ → auth MFE   │                          │
│  │  /remotes/*/    → other MFEs │                          │
│  └──────────────┬───────────────┘                          │
│                 │ API calls                                 │
│                 ▼                                           │
│  ┌──────────────────────────────┐                          │
│  │  Railway (HOBBY)             │                          │
│  │  your-api.up.railway.app     │                          │
│  │                              │                          │
│  │  NestJS API  (port 3000)     │                          │
│  │  PostgreSQL  (managed)       │                          │
│  └──────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1 — Deploy the Backend on Railway

### Step 1.1 — Push code to GitHub

Railway deploys from a Git repository.

```bash
# In C:\Users\ochap\Projects\life-tracker
git init
git add .
git commit -m "Initial commit"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/life-tracker.git
git push -u origin main
```

### Step 1.2 — Create Railway project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `life-tracker` repository
4. Railway will detect the Dockerfile in the root and start building

### Step 1.3 — Add PostgreSQL

1. In your Railway project, click **+ New** → **Database** → **PostgreSQL**
2. Railway creates a managed PostgreSQL instance and automatically adds `DATABASE_URL` to your service's environment

### Step 1.4 — Set environment variables

In Railway → your API service → **Variables**, add:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Generate a strong random string (see below) |
| `JWT_EXPIRES_IN` | `30d` |
| `ADMIN_EMAIL` | Your login email, e.g. `me@example.com` |
| `ADMIN_PASSWORD` | A strong password |
| `CORS_ORIGIN` | `https://YOUR-SITE.netlify.app` ← fill in after Step 2 |

> **Generate JWT_SECRET** (run in any terminal):
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

> **Note:** `DATABASE_URL` is added automatically by Railway when you add the PostgreSQL plugin. Do NOT set it manually.

### Step 1.5 — Configure deployment settings

In Railway → your service → **Settings**:
- **Root Directory**: leave blank (Dockerfile is at repo root)
- **Build Command**: leave blank (Dockerfile handles this)
- **Start Command**: leave blank (CMD in Dockerfile)
- **Port**: Railway auto-detects port `3000` from the `EXPOSE` directive

### Step 1.6 — Get your API URL

After the build succeeds, go to **Settings** → **Networking** → **Generate Domain**.

You'll get a URL like:
```
https://life-tracker-api-production.up.railway.app
```

**Save this URL** — you'll need it for the Netlify setup.

### Step 1.7 — Verify the API works

Open in browser:
```
https://YOUR-API-URL.up.railway.app/auth/me
```
You should get a `401 Unauthorized` (correct — the API is running, just needs a token).

---

## Part 2 — Deploy the Frontend on Netlify

### Step 2.1 — Sign up for Netlify

Go to [netlify.com](https://netlify.com) and sign up (free tier, no credit card needed).

### Step 2.2 — Connect GitHub repository

1. Click **Add new site** → **Import an existing project**
2. Choose **GitHub** and authorize Netlify
3. Select your `life-tracker` repository

### Step 2.3 — Configure build settings

Netlify will auto-detect `netlify.toml` from your repo. Verify:

| Setting | Value |
|---|---|
| **Build command** | `node scripts/build-frontend.js` |
| **Publish directory** | `dist-frontend` |
| **Node version** | `20` |

### Step 2.4 — Set environment variables

In Netlify → **Site settings** → **Environment variables**, add:

| Variable | Value |
|---|---|
| `API_URL` | `https://YOUR-API-URL.up.railway.app` |
| `NODE_ENV` | `production` |

### Step 2.5 — Deploy

Click **Deploy site**. Netlify will:
1. Clone your repo
2. Run `node scripts/build-frontend.js` which builds all 6 micro-frontends
3. Deploy the combined `dist-frontend/` directory

This takes 3–5 minutes on first build.

### Step 2.6 — Get your Netlify URL

After deployment you'll see something like:
```
https://life-tracker-abc123.netlify.app
```

You can rename it in **Site settings** → **Site name**.

### Step 2.7 — Update CORS on Railway

Go back to Railway → your API service → **Variables** and update:

```
CORS_ORIGIN = https://life-tracker-abc123.netlify.app
```

Railway will redeploy automatically.

### Step 2.8 — Test the full application

Open your Netlify URL and log in with the credentials you set in Railway:
- Email: the `ADMIN_EMAIL` value you configured
- Password: the `ADMIN_PASSWORD` value you configured

---

## Part 3 — Optional: Custom Domain

### Netlify custom domain

1. Netlify → **Domain settings** → **Add custom domain**
2. Point your DNS `CNAME` to `life-tracker-abc123.netlify.app`
3. Netlify issues an SSL certificate automatically (free via Let's Encrypt)
4. Update `CORS_ORIGIN` on Railway to your custom domain

### Railway custom domain

1. Railway → service → **Settings** → **Networking** → **Custom Domain**
2. Add `api.yourdomain.com`
3. Update `API_URL` on Netlify to `https://api.yourdomain.com`

---

## Part 4 — Telegram Bot (optional)

After deployment, add these to Railway environment variables:

| Variable | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Token from BotFather |
| `TELEGRAM_CHAT_ID` | Your Telegram user ID |
| `TELEGRAM_WEBHOOK_URL` | `https://YOUR-API-URL.up.railway.app/telegram/webhook` |

Then register the webhook:
```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://YOUR-API-URL.up.railway.app/telegram/webhook
```

---

## Troubleshooting

### Build fails on Netlify — "Cannot find module"

Make sure `node_modules` is NOT in `.gitignore` restrictions. Check that all packages are in `package.json` (not just installed locally).

### API returns 502 on Railway

Check the Railway build logs. Common issues:
- TypeScript compilation error → check `apps/api/src/` for type errors
- Database connection failed → verify PostgreSQL plugin is added and `DATABASE_URL` is set

### Login fails — "Invalid credentials"

The admin user is created on first API startup from `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars. If you changed these after initial deploy, you need to manually update the user in the database, or wipe and redeploy.

### Frontend loads but API calls fail (CORS error)

Check:
1. `CORS_ORIGIN` on Railway exactly matches your Netlify URL (no trailing slash)
2. `API_URL` on Netlify exactly matches your Railway API URL (no trailing slash)

### Micro-frontend remote fails to load

Open browser DevTools → Network tab. Look for failed requests to `/remotes/*/remoteEntry.js`.

If 404 — the remote wasn't built. Re-trigger a Netlify deploy.
If CORS error — check the `netlify.toml` headers section.

---

## Quick Reference

| Service | URL | Purpose |
|---|---|---|
| Railway | `https://railway.app/dashboard` | API + Database management |
| Netlify | `https://app.netlify.com` | Frontend deploys |
| Your app | `https://your-site.netlify.app` | Live application |
| Your API | `https://your-api.up.railway.app` | REST API |

## Redeploying after code changes

- **Push to GitHub** → Netlify and Railway auto-deploy on every push to `main`
- No manual steps needed after initial setup
