# Hell Let Loose CRM - Project Plan

## Overview
Building a CRM for Hell Let Loose that connects to CRCON API, tracks player statistics, and provides both admin and player interfaces.

**Tech Stack**: Next.js 14+, TypeScript, Supabase, Tailwind CSS, shadcn/ui

---

## Implementation Tasks

### 1. Initialize Next.js Project
- Create Next.js 14+ project with TypeScript and Tailwind CSS
- Install core dependencies: Supabase client, TanStack Query, shadcn/ui, Recharts
- Set up project structure with /app, /components, /lib, /types directories
- Configure environment variables for Supabase and CRCON API
- Initialize shadcn/ui and add essential components

### 2. Create Supabase Project and Database Schema
- Create new Supabase project
- Design and implement database tables:
  - `players` - Player profiles and identifiers
  - `player_statistics` - Aggregated player stats
  - `games` - Match history
  - `player_match_performance` - Per-match player stats
  - `admin_users` - Admin access control
  - `sync_configuration` - Sync settings
  - `sync_logs` - Sync history and errors
- Set up Row Level Security policies
- Configure authentication (email/password, Xbox, PlayStation OAuth)
- Generate TypeScript types from schema

### 3. Build CRCON API Integration Layer
- Create TypeScript client for CRCON API with proper types
- Implement core services:
  - `getPlayers()`, `getDetailedPlayerInfo()`, `getPlayersHistory()`
  - `getDateScoreboard()`, `getScoreboardMaps()`, `getLiveGameStats()`
- Implement admin actions:
  - `addVip()`, `removeVip()`, `messagePlayer()`
  - Kick/ban functions
- Add error handling, rate limiting, and retry logic
- Save to `/lib/crcon/`

### 4. Create Data Synchronization Engine
- Build Supabase Edge Function for scheduled player/stats sync
- Implement configurable sync interval (default 5 minutes)
- Create manual sync trigger API endpoint
- Set up pg_cron job for scheduled syncs
- Add sync logging and error recovery
- Create webhook receiver for CRCON events

### 5. Implement Authentication System
- Create login/register pages with email/password
- Set up Xbox and PlayStation OAuth flows
- Implement Discord account linking (separate flow)
- Create auth middleware for route protection
- Build role-based access control (admin vs player)
- Create `useAuth` hook

### 6. Build Admin Interface
- Create admin dashboard with key metrics and charts
- Build player list with search, filters, and actions
- Create detailed player profile pages
- Implement statistics/leaderboards page
- Add sync configuration interface
- Build user management page
- Create CRCON actions panel (VIP, messaging, moderation)

### 7. Build Player Interface
- Create player dashboard with personal stats overview
- Build detailed stats page (combat, role, weapon, map performance)
- Implement match history with filtering
- Create leaderboards page with personal rankings
- Add account settings and linking page
- Make responsive for mobile

### 8. Polish, Test, and Deploy
- Add loading states, error handling, and empty states
- Implement dark theme with gaming aesthetic
- Optimize performance (database indexes, caching, code splitting)
- Write tests for critical functionality
- Deploy to Vercel with environment variables
- Configure monitoring and alerts
- Import initial historical data from CRCON
- Document setup and deployment procedures

---

## Key Features

### Admin Interface
- View all player statistics
- Manage users (admins and players)
- Manual data sync triggers
- CRCON integration for VIP management and player messaging
- Player moderation tools

### Player Interface
- Login with username/password or Xbox/PlayStation OAuth
- View personal statistics dashboard
- Track performance metrics across matches
- View leaderboards and rankings
- Link Discord account

### Data Collection
- Configurable polling/webhook system
- Fetch player profiles, game statistics, and match history
- Track comprehensive player performance metrics
- Store historical data for trend analysis

---

## Future Enhancements (Deferred)
- Payment integration for premium features
- Data export capabilities
- Custom report generation
- Advanced analytics and insights
