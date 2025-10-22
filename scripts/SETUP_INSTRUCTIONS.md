# Billions Gaming Hub - Setup Instructions

## CRITICAL: Run This First!

Your database is currently empty (0 tables). You MUST run the MASTER_DATABASE_SCHEMA.sql file to set up all tables, functions, and triggers.

### Steps to Setup:

1. **Go to Supabase Dashboard**
   - Navigate to your Supabase project
   - Go to SQL Editor
   - Click "New Query"

2. **Copy and Paste the Schema**
   - Open `scripts/MASTER_DATABASE_SCHEMA.sql`
   - Copy ALL the content
   - Paste into the SQL Editor
   - Click "Run"

3. **Wait for Completion**
   - The script will create:
     - 8 tables (profiles, game_sessions, leaderboard, chat_messages, etc.)
     - 10+ functions (handle_new_user, award_game_rewards, apply_referral_bonus, etc.)
     - 3 triggers (auto-create profiles, auto-update leaderboard, auto-level-up)
     - Row Level Security (RLS) policies

4. **Create Storage Bucket**
   - Go to Storage in Supabase
   - Click "New Bucket"
   - Name it: `profile-pictures`
   - Make it PUBLIC
   - Click "Create Bucket"

5. **Verify Setup**
   - Go to Table Editor
   - You should see 8 tables listed
   - If you see 0 tables, the schema didn't run properly

## Environment Variables

Make sure these are set in your Vercel project:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

## Troubleshooting

If points aren't updating:
- Check that the `award_game_rewards` function exists
- Verify the `profiles` table has the `total_points` column
- Check browser console for errors

If referral system isn't working:
- Verify the `apply_referral_bonus` function exists
- Check that new users get 1000 starting points
- Ensure referral code is being passed during signup

If profile pictures aren't uploading:
- Verify the `profile-pictures` bucket exists and is PUBLIC
- Check that the bucket has proper RLS policies
- Ensure the file path is correct: `profile-pictures/{filename}`
