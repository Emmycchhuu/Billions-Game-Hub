# Billions Gaming Hub - Database Setup Guide

## Overview
This guide explains how to set up your Supabase database for the Billions Gaming Hub. Follow these steps carefully to ensure everything works correctly.

---

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: Billions Gaming Hub
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait 2-3 minutes

---

## Step 2: Run the Database Schema Script

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of `scripts/004_complete_database_schema.sql`
4. Paste it into the SQL editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. You should see: **"Success. No rows returned"**

### What This Script Does:

#### **Tables Created:**
- **profiles** - User accounts with points, verification status, profile pictures
- **verification_sessions** - Tracks human verification attempts
- **game_sessions** - Records every game played
- **leaderboard** - Ranked list of top players

#### **Security (RLS Policies):**
- Users can only edit their own profiles
- Users can only see their own game sessions
- Everyone can view the leaderboard
- Verification sessions are private to each user

#### **Automatic Features:**
- New users get 1000 starting points
- Random profile picture assigned on signup
- Leaderboard updates automatically when points change
- Profile stats update when games are played

---

## Step 3: Set Up Storage for Profile Pictures

1. In Supabase dashboard, go to **Storage** (left sidebar)
2. Click **"Create a new bucket"**
3. Settings:
   - **Name**: `profile-pictures`
   - **Public bucket**: ✅ Yes (check this box)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`
4. Click **"Create bucket"**

### Set Storage Policies:

1. Click on the `profile-pictures` bucket
2. Go to **Policies** tab
3. Click **"New Policy"**
4. Create these two policies:

**Policy 1: Allow uploads**
\`\`\`sql
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' AND
  (storage.foldername(name))[1] = 'profile-pictures'
);
\`\`\`

**Policy 2: Allow public access**
\`\`\`sql
CREATE POLICY "Profile pictures are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');
\`\`\`

---

## Step 4: Get Your Environment Variables

1. In Supabase dashboard, go to **Settings → API**
2. Copy these values:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
\`\`\`

3. In Supabase dashboard, go to **Settings → Database**
4. Copy the connection string:

\`\`\`env
POSTGRES_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres
\`\`\`

---

## Step 5: Add Environment Variables to v0

1. In v0, click **"Vars"** in the left sidebar
2. Add each variable:
   - Click **"Add Variable"**
   - Enter the name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Paste the value
   - Click **"Save"**
3. Repeat for all 4 variables

---

## Step 6: Verify Everything Works

### Test Database Connection:
1. Go to your v0 preview
2. Try to sign up with a new account
3. Check if you receive 1000 starting points
4. Check if a random profile picture is assigned

### Test Profile Picture Upload:
1. Go to Profile Edit page
2. Click "Upload Custom Picture"
3. Select an image from your device
4. Verify it uploads and displays correctly

### Test Verification System:
1. Click on "Human Verification" card
2. Complete all 4 challenges:
   - Math questions (need 3/5 correct)
   - Billions quiz (need 3/5 correct)
   - Touch & hold (3 seconds)
   - Voice recording (3 seconds)
3. Check if verification badge appears on your profile

### Test Leaderboard:
1. Play some games to earn points
2. Go to Leaderboard page
3. Verify your profile picture shows
4. Check if top 3 have crowns/medals
5. Verify verified badge shows if you completed verification

---

## Troubleshooting

### "Supabase URL and Anon Key are required"
- Make sure all environment variables are added in v0 Vars section
- Variable names must match exactly (case-sensitive)
- Try refreshing the preview

### Profile pictures not uploading
- Check if `profile-pictures` bucket exists in Storage
- Verify bucket is set to **Public**
- Check storage policies are created correctly

### Leaderboard not updating
- Check if the trigger `trigger_update_leaderboard` exists
- Run this query to manually update:
\`\`\`sql
SELECT update_leaderboard() FROM profiles;
\`\`\`

### Points not changing after games
- Check if `trigger_update_profile_stats` exists
- Verify game_sessions table has data
- Check RLS policies allow inserts

---

## Database Schema Diagram

\`\`\`
┌─────────────────┐
│    auth.users   │ (Supabase Auth)
└────────┬────────┘
         │
         │ (1:1)
         ▼
┌─────────────────┐
│    profiles     │
│─────────────────│
│ • id (PK)       │
│ • username      │
│ • profile_pic   │
│ • points        │
│ • is_verified   │
└────────┬────────┘
         │
         ├─(1:N)──► game_sessions
         │
         ├─(1:N)──► verification_sessions
         │
         └─(1:1)──► leaderboard
\`\`\`

---

## SQL Queries for Testing

### Check user profile:
\`\`\`sql
SELECT * FROM profiles WHERE id = 'your-user-id';
\`\`\`

### View leaderboard:
\`\`\`sql
SELECT * FROM leaderboard ORDER BY rank ASC LIMIT 10;
\`\`\`

### Check game history:
\`\`\`sql
SELECT * FROM game_sessions 
WHERE user_id = 'your-user-id' 
ORDER BY created_at DESC;
\`\`\`

### Manually verify a user:
\`\`\`sql
UPDATE profiles 
SET is_verified = true, verification_date = NOW() 
WHERE id = 'your-user-id';
\`\`\`

---

## Need Help?

If you encounter issues:
1. Check the Supabase logs: **Logs → Postgres Logs**
2. Verify all tables exist: **Database → Tables**
3. Check RLS policies: **Authentication → Policies**
4. Test queries in SQL Editor

---

**Setup Complete!** 🎉

Your Billions Gaming Hub database is now ready. Users can:
- ✅ Sign up and get 1000 starting points
- ✅ Upload custom profile pictures
- ✅ Complete human verification
- ✅ Play games and earn/lose points
- ✅ Compete on the leaderboard
- ✅ View their game history
