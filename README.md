# Life Tracker

Personal productivity tracker with a micro-frontend architecture. Track sleep, daily productivity, energy levels, and learning progress — all in one place.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HOST SHELL (:3001)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Navigation│ │ Routing  │ │AuthContext│ │  Layout  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│  ┌──────┐ ┌──────────┐ ┌─────┐ ┌───────┐ ┌─────────┐      │
│  │ Auth │ │Dashboard │ │ Log │ │Courses│ │Analytics│      │
│  │:3002 │ │  :3003   │ │:3004│ │ :3005 │ │  :3006  │      │
│  └──────┘ └──────────┘ └─────┘ └───────┘ └─────────┘      │
│              (Webpack Module Federation Remotes)            │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │  NestJS API   │
                    │    (:3000)    │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │  PostgreSQL   │
                    │    (:5432)    │
                    └───────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS, TypeORM, PostgreSQL, JWT, Passport |
| **Frontend** | React 18, Webpack 5 Module Federation, Tailwind CSS v3 |
| **Shared** | TypeScript types, API client, AuthContext |
| **Infra** | Docker Compose, nginx |

## Project Structure

```
life-tracker/
├── apps/
│   ├── api/            # NestJS backend (port 3000)
│   ├── host/           # Shell/container app (port 3001)
│   ├── auth/           # Login micro-frontend (port 3002)
│   ├── dashboard/      # Dashboard micro-frontend (port 3003)
│   ├── log/            # Quick entry micro-frontend (port 3004)
│   ├── courses/        # Courses micro-frontend (port 3005)
│   └── analytics/      # Analytics micro-frontend (port 3006)
├── packages/
│   └── shared/         # Shared types, API client, auth context
├── docker-compose.yml
└── package.json        # Workspace root
```

## Quick Start

### Prerequisites

- Node.js >= 20
- Docker & Docker Compose (for PostgreSQL)

### 1. Start the database

```bash
docker compose up postgres -d
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the API

```bash
npm run dev:api
```

### 4. Start all micro-frontends

```bash
npm run dev:web
```

Or start individually:

```bash
npm run dev:host       # Shell on :3001
npm run dev:auth       # Login on :3002
npm run dev:dashboard  # Dashboard on :3003
npm run dev:log        # Log on :3004
npm run dev:courses    # Courses on :3005
npm run dev:analytics  # Analytics on :3006
```

### 5. Open the app

Visit [http://localhost:3001](http://localhost:3001)

Default credentials:
- Email: `admin@lifetracker.dev`
- Password: `admin123`

## Development Phases

- **Phase 1** — Monorepo + Docker + DB entities + Auth + Micro-frontend shell
- **Phase 2** — Logging modules (sleep, daily, energy, learning, courses)
- **Phase 3** — Dashboard charts + Analytics
- **Phase 4** — Telegram bot + Cron reminders + PWA

## Ports Reference

| Service | Port |
|---------|------|
| NestJS API | 3000 |
| Host Shell | 3001 |
| Auth Remote | 3002 |
| Dashboard Remote | 3003 |
| Log Remote | 3004 |
| Courses Remote | 3005 |
| Analytics Remote | 3006 |
| PostgreSQL | 5432 |
| pgAdmin | 5050 |
