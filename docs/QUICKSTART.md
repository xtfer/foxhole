# Quick Start Guide

## 🚀 Local Development Setup

Your local Supabase instance is **already running** with all migrations applied!

### Local Services

- **API**: http://127.0.0.1:54521
- **Studio**: http://127.0.0.1:54523 (Database management UI)
- **Database**: postgresql://postgres:postgres@127.0.0.1:54522/postgres
- **Email Testing**: http://127.0.0.1:54524 (View test emails)

### Start the Next.js Dev Server

```bash
npm run dev
```

Then visit: http://localhost:3000

## ✅ What's Set Up

1. ✅ Local Supabase running on custom ports (545xx)
2. ✅ Database schema applied (all 6 tables with RLS)
3. ✅ Environment variables configured (`.env.local`)
4. ✅ CRCON API token configured

## 🎯 Next Steps

### 1. Create Your First Admin User

Visit http://localhost:3000/register and create an account:
- Email: admin@example.com
- Password: (minimum 6 characters)
- Player Name: Your name

Then set yourself as admin:

```env
ADMIN_EMAILS=admin@example.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

### 2. Test Authentication

1. Sign out and sign back in
2. You should be redirected to `/admin` (admin users)
3. Regular users go to `/player`

### 3. Trigger Data Sync

Once logged in as admin, you can trigger a manual sync.

## 🛠️ Useful Commands

### Supabase Commands

```bash
# View status
supabase status

# Stop Supabase
supabase stop

# Restart Supabase
supabase stop && supabase start

# View logs
supabase logs

# Reset database (reapply migrations)
supabase db reset

# Create new migration
supabase migration new migration_name
```

### Database Access

```bash
# Connect to database
psql postgresql://postgres:postgres@127.0.0.1:54522/postgres

# Or through Studio
open http://127.0.0.1:54523
```

## 📊 View Data in Studio

1. Open http://127.0.0.1:54523
2. Navigate to **Table Editor**
3. View/edit: `players`, `player_statistics`, `games`, etc.
4. Check **SQL Editor** to run custom queries
5. View **Authentication** users

## 🔧 Troubleshooting

### Port Conflicts

If you get port conflicts with other Supabase projects:

```bash
# Stop other projects first
supabase stop --project-id other-project-name

# Or change ports in supabase/config.toml
```

### Reset Everything

```bash
# Stop and remove all containers
supabase stop
supabase db reset

# Restart
supabase start
```

### View Real-Time Logs

```bash
# Database logs
docker logs supabase_db_hll-crm -f

# API logs
docker logs supabase_kong_hll-crm -f
```

## 📧 Email Testing

All emails sent by the app are captured locally:
- Visit: http://127.0.0.1:54524
- View registration confirmations, password resets, etc.

## 🗄️ Database Schema

Tables created:
- `players` - Player profiles
- `player_statistics` - Aggregated stats by time period
- `games` - Match history
- `player_match_performance` - Per-match player data
- `sync_configuration` - Sync settings
- `sync_logs` - Sync execution logs

View the schema: `supabase/migrations/20241230000000_initial_schema.sql`

## 🌐 Production Deployment

When ready for production:

1. Create a project at https://supabase.com
2. Run the migration:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```
3. Update `.env.local` with production credentials
4. Deploy to Vercel

## 📝 Notes

- Local Supabase uses custom ports (545xx) to avoid conflicts
- Database is persisted in Docker volumes
- Stopping Supabase keeps data, `db reset` clears it
- Studio password: Check terminal output from `supabase start`
