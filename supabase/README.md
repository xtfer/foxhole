# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Note down your project URL and anon key

## 2. Run Database Schema

1. Open the Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Run the script

## 3. Configure Authentication

### Email/Password Authentication
1. In Supabase dashboard, go to Authentication > Providers
2. Email provider is enabled by default
3. Configure email templates if needed

### Xbox OAuth (Optional)
1. Go to Authentication > Providers
2. Enable "Azure" provider
3. Add Xbox Live credentials:
   - Client ID
   - Client Secret
4. Configure redirect URL

### PlayStation OAuth (Optional)
1. Go to Authentication > Providers
2. You may need to use a generic OAuth provider
3. Configure PlayStation Network OAuth credentials
4. Set up redirect URLs

## 4. Set Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRCON_API_URL=http://145.223.22.23:8010/api
CRCON_API_TOKEN=your_crcon_token
```

## 5. User Roles

The app uses a simple role system stored in user metadata:
- `admin`: Full access to all features
- `player`: Access to personal stats only

To set a user as admin:
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{role}',
  '"admin"'
)
WHERE email = 'admin@example.com';
```

## 6. Edge Functions (for data sync)

Edge functions for syncing data will be in the `supabase/functions/` directory.
Deploy them using:

```bash
npx supabase functions deploy sync-players
```

## 7. Database Types Generation

Generate TypeScript types from your database:

```bash
npx supabase gen types typescript --project-id your_project_id > types/database.ts
```
