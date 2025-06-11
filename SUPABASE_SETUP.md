# Supabase Setup Guide for Hesu Investment Limited Asset Register

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in
4. Click "New Project"
5. Choose your organization
6. Fill in project details:
   - **Name**: `hesu-asset-register`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
7. Click "Create new project"
8. Wait for project to be ready (2-3 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project API Key** (anon/public key)

## Step 3: Set Up Environment Variables

Create a `.env.local` file in your project root with:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
\`\`\`

**Important**: Replace the placeholder values with your actual Supabase credentials.

## Step 4: Run Database Setup

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the content from `scripts/01-create-tables.sql`
4. Click "Run" to create tables and setup
5. Create another new query
6. Copy and paste the content from `scripts/02-seed-data.sql`
7. Click "Run" to insert sample data

## Step 5: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see the `devices` table with sample data
3. Restart your Next.js application
4. The blue "demo data" banner should disappear
5. All CRUD operations will now persist to your database

## Step 6: Security Configuration (Optional)

For production use, consider:

1. **Row Level Security**: Already enabled with policies
2. **API Rate Limiting**: Configure in Supabase dashboard
3. **Database Backups**: Enable automatic backups
4. **Custom Domain**: Set up custom domain for your project

## Troubleshooting

### Common Issues:

1. **"Missing environment variables" error**:
   - Check `.env.local` file exists in project root
   - Verify variable names match exactly
   - Restart your development server

2. **Database connection fails**:
   - Verify your project URL and API key
   - Check if your Supabase project is active
   - Ensure you're using the correct region

3. **Tables not found**:
   - Run the SQL scripts in the correct order
   - Check the SQL Editor for any error messages
   - Verify tables exist in Table Editor

### Support:
- Supabase Documentation: [docs.supabase.com](https://docs.supabase.com)
- Community Support: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)

## Features Enabled with Supabase:

✅ **Real-time Data Sync**: Changes appear instantly across all users
✅ **Persistent Storage**: Data survives application restarts
✅ **Scalable Database**: PostgreSQL with automatic scaling
✅ **Backup & Recovery**: Automatic daily backups
✅ **Security**: Row-level security and API authentication
✅ **Performance**: Optimized queries with proper indexing
\`\`\`

Let's also create a setup verification component:
