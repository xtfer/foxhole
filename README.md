# Foxhole: The Hell Let Loose CRM

A CRM system for Hell Let Loose game servers that integrates with CRCON API to track player statistics, manage VIPs, and provide both admin and player interfaces.

## Tech Stack

- **Frontend**: Next.js 14 with React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Data Fetching**: TanStack Query
- **Charts**: Recharts
- **Integration**: CRCON API

## Project Status

This project is under active development. It has not been fully tested. Use at your own risk.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Local Development (Recommended)

**Local Supabase is already set up and running!**

- API: http://127.0.0.1:54521
- Studio: http://127.0.0.1:54523
- Database: postgresql://postgres:postgres@127.0.0.1:54522/postgres

Environment variables are already configured in `.env.local`.

**OR**

### 2. Production Supabase

For production setup:
1. Create a new Supabase project at https://supabase.com
2. Run migrations: `supabase link --project-ref YOUR_REF && supabase db push`
3. Update `.env.local` with production credentials

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
hll-crm/
├── app/                  # Next.js app directory
│   ├── admin/           # Admin interface pages
│   ├── player/          # Player interface pages
│   └── api/             # API routes
├── components/          # React components
│   └── ui/              # shadcn/ui components
├── lib/                 # Utility libraries
│   ├── crcon/           # CRCON API client
│   └── supabase/        # Supabase clients
├── types/               # TypeScript type definitions
│   └── crcon.ts         # CRCON API types
├── supabase/            # Supabase configuration
│   ├── schema.sql       # Database schema
│   └── README.md        # Setup instructions
└── tmp/                 # Temporary files
    └── PROJECT_PLAN.md  # Development plan
```

## Features

### Admin Interface
- Dashboard with server statistics and player metrics
- Player management (search, filter, view profiles)
- CRCON integration (VIP management, messaging, moderation)
- Sync configuration and monitoring
- User management

### Player Interface
- Personal statistics dashboard
- Detailed performance metrics (combat, roles, weapons, maps)
- Match history with filters
- Leaderboards with personal rankings
- Account settings and OAuth linking

### Data Synchronization
- Configurable sync intervals (default: 5 minutes)
- Manual sync triggers
- Automatic data collection from CRCON
- Error logging and recovery
- Webhook support

## CRCON API Integration

The CRCON client (`lib/crcon/client.ts`) provides typed methods for all CRCON API endpoints. See the [CRCON API docs](docs/CRCON API DOCS.md) for details.

## Database Schema

The database includes tables for players, statistics, games, match performance, and sync configuration. See `supabase/schema.sql` for full schema details.
