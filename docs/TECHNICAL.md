# Life Tracker — Technical Documentation

Complete technical documentation of the Life Tracker architecture, design decisions, and implementation details.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Monorepo Structure](#monorepo-structure)
3. [Technology Stack](#technology-stack)
4. [Backend (NestJS API)](#backend-nestjs-api)
5. [Frontend (Micro-frontends)](#frontend-micro-frontends)
6. [Shared Package](#shared-package)
7. [Database Schema](#database-schema)
8. [Authentication Flow](#authentication-flow)
9. [Module Federation Setup](#module-federation-setup)
10. [Docker & Infrastructure](#docker--infrastructure)
11. [PWA Configuration](#pwa-configuration)
12. [Telegram Bot Integration](#telegram-bot-integration)
13. [Development Workflow](#development-workflow)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                       │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Host Shell (:3001)                       │ │
│  │  ┌──────────┬──────────┬──────────┬───────────────┐ │ │
│  │  │  Auth    │Dashboard │   Log    │   Courses     │ │ │
│  │  │ (:3002)  │ (:3003)  │ (:3004)  │  (:3005)     │ │ │
│  │  ├──────────┴──────────┴──────────┴───────────────┤ │ │
│  │  │             Analytics (:3006)                    │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
│                          │ HTTP (JWT)                      │
│                          ▼                                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              NestJS API (:3000)                       │ │
│  │  Auth │ Sleep │ Daily │ Energy │ Courses │ Analytics │ │
│  │              Telegram │ Scheduler                     │ │
│  └──────────────────────┬──────────────────────────────┘ │
│                          │ TypeORM                         │
│                          ▼                                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │            PostgreSQL (:5433)                         │ │
│  │   users │ sleep_logs │ daily_logs │ energy_checks     │ │
│  │   courses │ course_progress │ learning_logs           │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

The application uses a **micro-frontend architecture** with a NestJS backend. The frontend is composed of 6 independently deployed applications that are loaded at runtime by the host shell using Webpack 5 Module Federation.

---

## Monorepo Structure

```
life-tracker/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/           # Authentication module
│   │   │   ├── sleep/          # Sleep logging module
│   │   │   ├── daily/          # Daily score module
│   │   │   ├── energy/         # Energy check module
│   │   │   ├── courses/        # Course management module
│   │   │   ├── learning/       # Learning logs module
│   │   │   ├── analytics/      # Analytics module
│   │   │   ├── telegram/       # Telegram bot module
│   │   │   ├── database/       # TypeORM config & migrations
│   │   │   └── main.ts         # Entry point
│   │   ├── .env                # Environment variables
│   │   └── package.json
│   │
│   ├── host/                   # Shell (container) app
│   │   ├── src/
│   │   │   ├── components/     # Layout, RemoteLoader
│   │   │   ├── App.tsx         # Router + AuthProvider
│   │   │   ├── bootstrap.tsx   # Async entry point
│   │   │   ├── index.ts        # Dynamic import entry
│   │   │   ├── styles.css      # Tailwind entry
│   │   │   ├── manifest.json   # PWA manifest
│   │   │   └── sw.js           # Service worker
│   │   ├── webpack.config.js   # Module Federation host config
│   │   └── package.json
│   │
│   ├── auth/                   # Login micro-frontend
│   ├── dashboard/              # Dashboard micro-frontend
│   ├── log/                    # Daily logging micro-frontend
│   ├── courses/                # Course management micro-frontend
│   └── analytics/              # Analytics micro-frontend
│
├── packages/
│   └── shared/                 # Shared library
│       └── src/
│           ├── types/          # TypeScript interfaces
│           ├── api/            # HTTP client (api.get, api.post, etc.)
│           └── auth/           # AuthContext (React Context)
│
├── docker-compose.yml          # PostgreSQL + pgAdmin
├── package.json                # Root workspace config
├── tsconfig.base.json          # Shared TypeScript settings
└── docs/
    ├── USER_GUIDE.md           # End-user documentation
    └── TECHNICAL.md            # This file
```

**npm Workspaces** manage dependencies across the monorepo. A single `npm install` at the root installs dependencies for all apps and packages. Shared dependencies (React, TypeScript) are hoisted to the root `node_modules/`.

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| NestJS | 11.x | Backend framework (modules, DI, decorators) |
| TypeORM | 0.3.x | Object-Relational Mapper for PostgreSQL |
| PostgreSQL | 16 | Relational database |
| Passport + JWT | — | Authentication strategy |
| class-validator | 0.14.x | Request DTO validation |
| @nestjs/schedule | 5.x | Cron-based scheduled tasks |
| node-telegram-bot-api | 0.66.x | Telegram bot integration |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.x | UI component library |
| Webpack | 5.x | Bundler with Module Federation |
| TypeScript | 5.7.x | Static type checking |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| React Router | 7.x | Client-side routing |
| Recharts | 2.x | Chart library (analytics page) |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Docker Compose | Database orchestration |
| npm Workspaces | Monorepo dependency management |
| Service Worker | PWA offline support |

---

## Backend (NestJS API)

### Module Architecture

Each domain has its own NestJS module following the pattern:

```
module/
├── module-name.module.ts      # Module declaration
├── module-name.service.ts     # Business logic
├── module-name.controller.ts  # HTTP endpoints
├── module-name.entity.ts      # TypeORM entity
└── dto/
    └── create-*.dto.ts        # Request validation
```

### Modules

#### AuthModule
- **POST /auth/login** — authenticate with email/password, returns JWT
- **GET /auth/me** — returns the current user (requires valid JWT)
- **JwtAuthGuard** — global guard applied to all routes
- **@Public()** decorator — marks routes that skip authentication
- **@GetUser()** decorator — extracts user from request object
- Admin user is automatically seeded on startup

#### SleepModule
- **POST /sleep** — create a sleep log entry
- **GET /sleep** — list sleep logs (supports `?from=&to=` date filters)
- **GET /sleep/latest** — most recent sleep entry
- **GET /sleep/stats** — aggregated sleep statistics

#### DailyModule
- **POST /daily** — create or update (upsert) a daily log
- **GET /daily** — list daily logs with date filters
- **GET /daily/today** — today's entry
- **GET /daily/stats** — aggregated daily statistics

#### EnergyModule
- **POST /energy** — create an energy check-in
- **GET /energy** — list energy checks
- **GET /energy/latest** — most recent check-in
- **GET /energy/peak** — time of day with highest average energy

#### CoursesModule
- Full CRUD for courses
- **POST /courses/:id/progress** — log a study session
- **GET /courses/:id/stats** — course statistics (current lesson, days to deadline, pace required)
- **GET /courses/study-hours** — total study hours this week

#### LearningModule
- **POST /learning** — create a learning log entry
- **GET /learning** — list entries with optional course filter

#### AnalyticsModule
- **GET /analytics/weekly** — aggregated weekly summaries (last 4 weeks)
- **GET /analytics/patterns** — weekday vs. weekend score patterns

#### TelegramModule
- **POST /telegram/webhook** — receives Telegram updates
- **TelegramSchedulerService** — sends daily reminders via cron

### Data Validation

Request bodies are validated using **class-validator** decorators in DTO classes:

```typescript
export class CreateSleepDto {
  @IsDateString()
  date: string;

  @IsISO8601()
  bedTime: string;

  @IsISO8601()
  wakeTime: string;

  @IsInt()
  @Min(1)
  @Max(5)
  quality: number;

  @IsOptional()
  @IsString()
  note?: string;
}
```

The `ValidationPipe` in `main.ts` automatically rejects invalid requests with descriptive error messages.

### Entity Lifecycle Hooks

Some entities use TypeORM's `@BeforeInsert()` to compute derived fields:

```typescript
// In daily-log.entity.ts
@BeforeInsert()
calculateScore() {
  this.score = parseFloat(
    ((this.planPct / 100) * 5 + this.focus + this.energy).toFixed(2)
  );
}
```

---

## Frontend (Micro-frontends)

### App Structure

Each micro-frontend follows the same structure:

```
app-name/
├── src/
│   ├── index.ts           # import('./bootstrap') — required for Module Federation
│   ├── bootstrap.tsx       # React.createRoot + render
│   ├── pages/
│   │   └── PageName.tsx    # Main exposed component
│   ├── components/
│   │   └── *.tsx           # Local components
│   └── api/
│       └── index.ts        # API functions using shared client
├── webpack.config.js       # Module Federation config
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS (Tailwind + Autoprefixer)
├── tsconfig.json           # TypeScript config
└── package.json
```

### Why `index.ts` → `bootstrap.tsx`?

Module Federation requires an async boundary for shared module negotiation. The entry point (`index.ts`) contains only:

```typescript
import('./bootstrap');
```

This dynamic `import()` creates the async boundary that allows Webpack to negotiate shared dependencies (React, React Router) before the app renders.

### Component Design Principles

1. **Mobile-first** — all components designed for touch, then enhanced for desktop
2. **Instant feedback** — live previews (score calculation, sleep duration)
3. **Optimistic loading** — skeleton loaders while data fetches
4. **Error resilience** — Promise.allSettled prevents one failing API from blocking others
5. **State persistence** — active tab saved to localStorage

---

## Shared Package

`packages/shared/` contains code used by multiple micro-frontends:

### Types (`types/index.ts`)
TypeScript interfaces matching the backend entities:
- `User`, `LoginRequest`, `LoginResponse`
- `SleepLog`, `DailyLog`, `EnergyCheck`
- `Course`, `CourseProgress`, `CourseStats`
- `LearningLog`

### API Client (`api/client.ts`)
Centralized HTTP client wrapping `fetch()`:
- Automatic JWT token attachment
- Centralized error handling
- 401 → redirect to login
- Convenience methods: `api.get()`, `api.post()`, `api.patch()`, `api.delete()`

### AuthContext (`auth/AuthContext.tsx`)
React Context for authentication state:
- `AuthProvider` — wraps the host app
- `useAuth()` — hook for consuming auth state
- Validates stored JWT on page load via `GET /auth/me`
- Provides `login()`, `logout()`, `user`, `isAuthenticated`, `isLoading`

**Important:** AuthContext works only within the host's React tree. Remote micro-frontends cannot use `useAuth()` because each bundle gets its own React Context instance. The auth remote calls the API directly and stores the JWT in localStorage.

---

## Database Schema

### Entity Relationship Diagram

```
users (1) ──── (N) sleep_logs
users (1) ──── (N) daily_logs
users (1) ──── (N) energy_checks
users (1) ──── (N) courses
users (1) ──── (N) learning_logs
courses (1) ── (N) course_progress
courses (1) ── (N) learning_logs
```

### Tables

#### users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key, auto-generated |
| email | VARCHAR | Unique |
| password | VARCHAR | bcrypt hash |
| created_at | TIMESTAMP | Auto-set |

#### sleep_logs
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users, CASCADE delete |
| date | DATE | |
| bed_time | TIMESTAMP | |
| wake_time | TIMESTAMP | |
| duration_min | INTEGER | Computed from bed/wake times |
| quality | SMALLINT | 1-5 |
| note | TEXT | Optional |
| created_at | TIMESTAMP | |

#### daily_logs
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| date | DATE | Unique per user |
| plan_pct | SMALLINT | 0-100 |
| focus | SMALLINT | 1-3 |
| energy | SMALLINT | 1-2 |
| score | DECIMAL(4,2) | Computed |
| note | TEXT | Optional |
| created_at | TIMESTAMP | |

#### energy_checks
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| checked_at | TIMESTAMP | Defaults to NOW() |
| level | SMALLINT | 1-10 |
| note | TEXT | Optional |

#### courses
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| name | VARCHAR | |
| total_lessons | INTEGER | |
| deadline | DATE | |
| is_active | BOOLEAN | Default true |
| created_at | TIMESTAMP | |

#### course_progress
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| course_id | UUID | FK → courses |
| date | DATE | |
| lessons_from | INTEGER | |
| lessons_to | INTEGER | |
| duration_min | INTEGER | Optional |
| note | TEXT | Optional |
| created_at | TIMESTAMP | |

#### learning_logs
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| course_id | UUID | FK → courses |
| date | DATE | Defaults to today |
| insight | TEXT | Required (min 10 chars) |
| confusion | TEXT | Optional |
| duration_min | INTEGER | Optional |
| created_at | TIMESTAMP | |

---

## Authentication Flow

```
Client                          Server
  │                                │
  │  POST /auth/login              │
  │  { email, password }           │
  │──────────────────────────────► │
  │                                │ bcrypt.compare(password, hash)
  │  { accessToken: "jwt..." }     │ jwt.sign({ sub: user.id })
  │◄────────────────────────────── │
  │                                │
  │  localStorage.setItem(token)   │
  │                                │
  │  GET /auth/me                  │
  │  Authorization: Bearer jwt...  │
  │──────────────────────────────► │
  │                                │ JwtStrategy.validate()
  │  { id, email, created_at }     │ extracts user from token
  │◄────────────────────────────── │
```

- JWT tokens expire after 30 days (configurable via `JWT_EXPIRES_IN`)
- The `JwtAuthGuard` is applied **globally** — every route requires auth by default
- Routes decorated with `@Public()` bypass the guard (only `/auth/login`)
- On 401 response, the client clears the token and redirects to `/login`

---

## Module Federation Setup

### How It Works

1. Each remote app runs its own Webpack dev server on a unique port
2. Each remote exposes components via `ModuleFederationPlugin.exposes`
3. The host declares remotes with their URLs in `ModuleFederationPlugin.remotes`
4. At runtime, the host fetches `remoteEntry.js` from each remote's server
5. Shared dependencies (React, React Router) are loaded once and shared

### Host Configuration (simplified)

```javascript
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    auth: 'auth@http://localhost:3002/remoteEntry.js',
    dashboard: 'dashboard@http://localhost:3003/remoteEntry.js',
    // ...
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.3.1', eager: true },
    'react-dom': { singleton: true, requiredVersion: '^18.3.1', eager: true },
    'react-router-dom': { singleton: true, requiredVersion: '^7.1.0', eager: true },
  },
})
```

### Remote Configuration (simplified)

```javascript
new ModuleFederationPlugin({
  name: 'dashboard',
  filename: 'remoteEntry.js',
  exposes: {
    './DashboardPage': './src/pages/DashboardPage',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.3.1' },
    'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
    'react-router-dom': { singleton: true, requiredVersion: '^7.1.0' },
  },
})
```

### Key: `singleton: true`

React must be loaded exactly once — if each micro-frontend loaded its own React, hooks would break (React tracks hook state per instance). `singleton: true` ensures only one copy of React is shared across all federated modules.

### Context Boundary Limitation

React Context does **not** cross Module Federation boundaries. Each bundle creates its own context instance. This is why:
- `AuthProvider` lives in the host and wraps the entire app
- `useAuth()` works in host components but **not** in remote components
- The auth remote calls the API directly instead of using `useAuth()`

---

## Docker & Infrastructure

### docker-compose.yml Services

#### postgres
- Image: `postgres:16-alpine`
- Port: `5433:5432` (mapped to 5433 to avoid local PG conflict)
- Volume: `pgdata` for persistent data
- Health check: `pg_isready`

#### pgAdmin (optional)
- Image: `dpage/pgadmin4`
- Port: `5050:80`
- Credentials: `admin@admin.com` / `admin`

### Environment Variables (apps/api/.env)

```env
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=life_tracker
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d
ADMIN_EMAIL=admin@lifetracker.dev
ADMIN_PASSWORD=admin123
TELEGRAM_BOT_TOKEN=           # Optional
TELEGRAM_WEBHOOK_URL=         # Optional
```

---

## PWA Configuration

### manifest.json
Defines the app metadata for installation:
- App name, short name, description
- Start URL: `/`
- Display: `standalone` (no browser chrome)
- Theme and background colors
- Icon references (192px, 512px)

### Service Worker (sw.js)
Implements a **network-first** caching strategy:
1. On install: caches the app shell (HTML, CSS, JS)
2. On fetch: tries network first, falls back to cache
3. On activate: cleans up old caches

This ensures users always get the latest version when online, but can still use the app when offline (with cached data).

### Webpack Integration
`copy-webpack-plugin` copies `manifest.json` and `sw.js` from `src/` to the build output. The HTML template includes:
- `<link rel="manifest" href="/manifest.json">`
- `<link rel="apple-touch-icon" href="/icon-192.png">`
- A script that registers the service worker

---

## Telegram Bot Integration

### Architecture

```
Telegram API ──webhook──► POST /telegram/webhook
                                    │
                          TelegramService
                          ├── parseCommand()
                          ├── handleSleep()
                          ├── handleEnergy()
                          └── sendMessage()
                                    │
                          Reuses existing services:
                          SleepService, DailyService, EnergyService
```

### Scheduler
`TelegramSchedulerService` uses `@Cron()` decorators to send:
- Morning reminder (08:00) — "Don't forget to log your sleep!"
- Evening reminder (21:00) — "Time to log your daily score!"

---

## Development Workflow

### Prerequisites
- Node.js 20+
- Docker Desktop (for PostgreSQL)
- npm 9+

### Quick Start

```bash
# 1. Clone and install
git clone <repo>
cd life-tracker
npm install

# 2. Start PostgreSQL
docker compose up postgres -d

# 3. Start everything (API + all frontends)
npm run dev
```

### Individual Commands

```bash
npm run dev:api        # NestJS API on :3000
npm run dev:host       # Host shell on :3001
npm run dev:auth       # Auth remote on :3002
npm run dev:dashboard  # Dashboard remote on :3003
npm run dev:log        # Log remote on :3004
npm run dev:courses    # Courses remote on :3005
npm run dev:analytics  # Analytics remote on :3006
```

### TypeScript Checking

```bash
# Check a specific app
cd apps/api && npx tsc --noEmit

# Check all workspaces
npm run build --workspaces --if-present
```

### Adding a New Micro-frontend

1. Create `apps/new-app/` with the standard structure
2. Add `ModuleFederationPlugin` to its webpack config (expose the page component)
3. Add the remote to the host's webpack config
4. Add a `React.lazy()` import and route in `apps/host/src/App.tsx`
5. Add npm scripts in the root `package.json`

### Database Migrations

```bash
cd apps/api

# Generate a migration from entity changes
npm run migration:generate -- -n MigrationName

# Run pending migrations
npm run migration:run
```

> **Note:** In development, `synchronize: true` auto-creates tables from entities. In production, always use migrations.
