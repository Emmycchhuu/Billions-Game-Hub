# Environment Variables Setup Guide

## Required Environment Variables

Your Billions Gaming Hub needs these environment variables to work properly. Add them to your Vercel project:

### Supabase Configuration

\`\`\`env
# Public (visible in browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Secret (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
\`\`\`

## How to Get These Values

### 1. Get Your Supabase URL and Keys

1. Go to [supabase.com](https://supabase.com) and log in
2. Select your project
3. Go to **Settings → API**
4. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Add to Vercel

1. Go to your Vercel project
2. Click **Settings → Environment Variables**
3. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your project URL
   - Click "Add"
4. Repeat for all variables
5. **Important**: For `NEXT_PUBLIC_*` variables, select "Plaintext" (they're public)
6. For `SUPABASE_SERVICE_ROLE_KEY`, select "Encrypted" (it's secret)

### 3. Redeploy

After adding environment variables:
1. Go to **Deployments**
2. Click the three dots on the latest deployment
3. Click **Redeploy**

## Verify Setup

After deployment, check:
1. Dashboard loads without errors
2. Can sign up and get 1000 starting points
3. Can play games and earn points
4. Profile picture upload works
5. Referral code works

## Troubleshooting

**"Supabase credentials missing" error**
- Check that env vars are added to Vercel
- Make sure you redeployed after adding them
- Check that `NEXT_PUBLIC_*` variables are set to "Plaintext"

**Database shows 0 tables**
- Run the MASTER_DATABASE_SCHEMA.sql in Supabase SQL Editor
- Wait for it to complete
- Refresh the page

**Points not updating**
- Check that the `award_game_rewards` function exists in Supabase
- Verify the `profiles` table has `total_points` column
- Check browser console for errors

**Profile pictures not uploading**
- Verify `profile-pictures` bucket exists in Supabase Storage
- Make sure bucket is set to PUBLIC
- Check that RLS policies are correct
