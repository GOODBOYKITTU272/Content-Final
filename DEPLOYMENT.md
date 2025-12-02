# Deployment Guide - Supabase Migrations & Edge Functions

## Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

## Step 1: Apply Database Migrations

### Option A: Using Supabase SQL Editor (Recommended for first-time)

1. Open your Supabase dashboard at https://app.supabase.com
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" to execute
5. Repeat for `supabase/migrations/002_rls_policies.sql`

### Option B: Using Supabase CLI

```bash
# Apply all migrations
supabase db push

# OR apply specific migration
supabase db push --include-all
```

### Verify Migrations

After running migrations, verify in your Supabase dashboard:

- **Database > Tables**: You should see `users`, `projects`, `project_data`, `workflow_history`, `system_logs`
- **Database > Roles**: Check that RLS is enabled on all tables
- **Database > Policies**: Verify all policies are created

## Step 2: Deploy Edge Function

### Deploy the invite-user function

```bash
# Deploy Edge Function
supabase functions deploy invite-user

# Set environment variables for the function
# These are automatically available in Edge Functions:
# - SUPABASE_URL (already set)
# - SUPABASE_SERVICE_ROLE_KEY (already set)
```

### Test the Edge Function

```bash
# Get your access token from the Supabase dashboard or via:
supabase auth login

# Then test with curl:
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/invite-user' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"email":"test@example.com","full_name":"Test User","role":"WRITER"}'
```

## Step 3: Update Environment Variables

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Seed Initial Users (Optional)

The migration includes seed data for demo users. To use them:

1. Go to Supabase Dashboard > Authentication > Users
2. For each demo user, manually set a password or send them a password reset email
3. Or modify the seed data section in `001_initial_schema.sql` to use your actual user emails

## Step 5: Test the Application

```bash
# Build to verify no errors
npm run build

# Run locally
npm run dev
```

Test the following:

1. **Login**: Use a user from the `users` table
2. **Create Project**: Create a new project as a Writer
3. **Workflow Transition**: Approve/reject projects to test workflow stages
4. **User Invite**: As Admin, invite a new user (tests Edge Function)

## Troubleshooting

### Migration Errors

If you get "type already exists" errors:
```sql
-- Run this in SQL Editor first
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
-- ... etc for all types
-- Then re-run the migration
```

### Edge Function Not Found

If you get 404 on Edge Function:
```bash
# Check deployed functions
supabase functions list

# Redeploy if needed
supabase functions deploy invite-user --no-verify-jwt
```

### RLS Blocking Queries

If RLS prevents access:
```sql
-- Temporarily disable RLS for testing (DO NOT do in production)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;

-- Or check policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

## Security Checklist

- [ ] Service role key is ONLY used in Edge Functions (server-side)
- [ ] Anon key is used in client code
- [ ] RLS is enabled on all tables
- [ ] Policies are tested for each role
- [ ] `.env` file is in `.gitignore`
- [ ] Environment variables are set in production (Vercel/Netlify)

## Schema Updates

When you update the schema in the future:

1. Create a new migration file: `supabase/migrations/003_your_change.sql`
2. Write your ALTER TABLE or other DDL statements
3. Test locally: `supabase db reset` (resets and reapplies all migrations)
4. Deploy to production: `supabase db push`

## Rollback

If something goes wrong:

```bash
# Reset local database
supabase db reset

# For production, create a rollback migration
# Example: supabase/migrations/004_rollback_003.sql
# Then: supabase db push
```

## Next Steps

1. Deploy your frontend to Vercel/Netlify
2. Set environment variables in your deployment platform  
3. Monitor Supabase logs at https://app.supabase.com > Logs
4. Set up monitoring and alerts for Edge Functions
