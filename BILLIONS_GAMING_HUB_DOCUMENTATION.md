# 🎮 BILLIONS GAMING HUB - COMPLETE DOCUMENTATION

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Database Schema](#database-schema)
4. [How It Works](#how-it-works)
5. [Supabase Capabilities](#supabase-capabilities)
6. [Deployment Guide](#deployment-guide)
7. [Game Mechanics](#game-mechanics)
8. [Technical Architecture](#technical-architecture)

---

## 🌟 Overview

**Billions Gaming Hub** is a comprehensive full-stack gaming platform built with Next.js, Supabase, and modern web technologies. It features a complete authentication system, multiple games, social features, and a robust points/leveling system.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TailwindCSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **UI Components**: shadcn/ui
- **State Management**: React Hooks + SWR
- **Authentication**: Supabase Auth (Email/Password)

---

## ✨ Features

### 1. **Authentication System**
- Email/password signup and login
- Automatic profile creation on signup
- Session management with middleware
- Protected routes
- Email confirmation (optional)

### 2. **User Profiles**
- Starting balance: **1000 points**
- Profile picture upload (Supabase Storage)
- Display name and username
- Game statistics tracking
- Verification badge system

### 3. **Points & Rewards System**
- Earn points by playing games
- Lose points when you lose games
- Points are used to play games (e.g., 50 points per spin)
- Real-time points updates

### 4. **Experience & Leveling**
- **Max Level**: 10
- Earn EXP from:
  - Playing games (20 EXP for wins, 5 EXP for losses)
  - Chatting in community (5 EXP per message)
  - Completing verification (50 EXP)
- **Level Progression**: 100 EXP per level
- Automatic level-up notifications

### 5. **Referral System**
- Unique 8-character referral code for each user
- **200 points bonus** for both referrer and referee
- Referral count tracking
- Leaderboard ranking by referrals

### 6. **Games**

#### **Spin Game**
- Cost: 50 points per spin
- Match 3 toys to win big
- Rewards:
  - 3 matches: 150-450 points
  - 2 matches: 50-150 points
  - No match: -50 points
- EXP: 20 for wins, 5 for losses

#### **Quiz Game**
- 10 random questions about Billions Network
- 15 seconds per question
- Rewards: 30-60 points per correct answer (based on speed)
- EXP: 10 per correct answer

#### **Find the Impostor**
- Identify the AI impostor among 6 agents
- 30 seconds to decide
- Rewards: 50-100 points (based on speed)
- EXP: 20 for wins, 5 for losses

### 7. **Leaderboard System**
- **Two Ranking Modes**:
  1. **By Points**: Shows top 100 players with points and level
  2. **By Referrals**: Shows top referrers
- Dashboard shows top 5 preview
- Profile pictures displayed
- Verification badges shown
- Crowns for top 3 players (🥇🥈🥉)

### 8. **Community Chat**
- Real-time messaging
- Profile pictures in chat
- Verification badges displayed
- **Message Retention**: 1 hour (auto-delete)
- **Rate Limiting**: 1 minute between messages
- **Moderation**:
  - Banned words detection
  - 24-hour bans for violations
  - Link filtering (only Twitter/X allowed)

### 9. **Human Verification System**
- **4 Verification Steps**:
  1. Math Questions (5 questions)
  2. Billions Quiz (5 questions)
  3. Touch & Hold Biometrics (3 seconds)
  4. Voice Verification (record & playback)
- **Pending State**: 2-3 minutes after completion
- **Verification Badge**: Added to profile after approval
- **Notifications**: Sent for pending and approved status

### 10. **Notification System**
- Referral bonuses
- Level ups
- Verification status updates
- Leaderboard changes
- Unread count badge
- Mark as read functionality

### 11. **Acknowledgements Page**
- Recognizes project contributors:
  - **Hizzy** 💙 - Project Advisor and Contributor
  - **Dvm** 💙 - Project Core Contributor
  - **Big_D** 💙 - Project Core Contributor

---

## 🗄️ Database Schema

The **MASTER_DATABASE_SCHEMA.sql** file handles everything from A to Z:

### Tables Created:

1. **profiles** - User data, points, EXP, level, referrals, verification
2. **game_sessions** - All game plays with points/EXP earned
3. **leaderboard** - Rankings by points and referrals
4. **chat_messages** - Community chat with 1-hour retention
5. **chat_bans** - 24-hour bans for moderation
6. **chat_rate_limits** - 1-minute rate limiting
7. **notifications** - User notifications
8. **verification_attempts** - Verification progress tracking

### Functions Created:

1. **handle_new_user()** - Auto-creates profile on signup
2. **update_leaderboard()** - Auto-updates rankings
3. **calculate_level()** - Calculates level from EXP
4. **update_level_on_exp_change()** - Auto-levels up users
5. **apply_referral_bonus()** - Handles referral rewards
6. **award_game_rewards()** - Awards points and EXP for games
7. **delete_old_chat_messages()** - Cleans up old messages
8. **is_user_banned()** - Checks ban status
9. **can_send_message()** - Checks rate limit

### Triggers Created:

1. **on_auth_user_created** - Creates profile on signup
2. **on_profile_updated** - Updates leaderboard
3. **on_exp_change** - Updates level and sends notifications

### Row Level Security (RLS):

All tables have RLS enabled with policies for:
- Users can view their own data
- Users can update their own data
- Public data (leaderboard, chat) is viewable by all
- Secure data (service functions) use SECURITY DEFINER

---

## 🔧 How It Works

### 1. **User Signup Flow**
\`\`\`
1. User signs up with email/password
2. Supabase Auth creates auth.users entry
3. Trigger fires: handle_new_user()
4. Profile created with:
   - 1000 starting points
   - Level 1, 0 EXP
   - Unique referral code
   - Default avatar
5. If referral code used:
   - Both users get 200 points
   - Referrer's count increases
   - Notifications sent
\`\`\`

### 2. **Game Play Flow**
\`\`\`
1. User clicks "Play Game"
2. Points deducted (e.g., 50 for spin)
3. Game logic executes
4. Result determined (win/loss)
5. award_game_rewards() called:
   - Points added/subtracted
   - EXP awarded
   - Game session recorded
   - Stats updated
6. If level up:
   - Level calculated
   - Notification sent
7. Leaderboard auto-updates
\`\`\`

### 3. **Chat Message Flow**
\`\`\`
1. User types message
2. Check if banned (is_user_banned)
3. Check rate limit (can_send_message)
4. Check for banned words
5. Check for invalid links
6. If all pass:
   - Message inserted
   - Rate limit updated
   - Realtime broadcast
7. After 1 hour:
   - Message auto-deleted
\`\`\`

### 4. **Verification Flow**
\`\`\`
1. User completes 4 verification steps
2. verification_pending set to true
3. Notification sent: "Pending"
4. After 2-3 minutes:
   - is_verified set to true
   - verification_pending set to false
   - Notification sent: "Approved"
   - Badge appears on profile
\`\`\`

---

## 🚀 Supabase Capabilities

### What Supabase Handles:

✅ **Authentication**
- Email/password signup and login
- Session management
- Token refresh
- Email confirmation
- Password reset

✅ **Database (PostgreSQL)**
- All tables and relationships
- Row Level Security (RLS)
- Triggers and functions
- Real-time subscriptions
- Complex queries and joins

✅ **Storage**
- Profile picture uploads
- Public/private buckets
- File management
- CDN delivery

✅ **Realtime**
- Community chat messages
- Leaderboard updates
- Notification updates
- Live game sessions

✅ **Edge Functions** (if needed)
- Custom API endpoints
- Webhooks
- Scheduled tasks

### What Supabase CAN Handle for Community Chat:

**YES** - Supabase is perfect for the community chat because:

1. **Realtime Subscriptions**: Messages appear instantly for all users
2. **Auto-deletion**: PostgreSQL functions can delete old messages
3. **Rate Limiting**: Database functions track message timing
4. **Moderation**: RLS policies and functions handle bans
5. **Scalability**: Can handle thousands of concurrent users
6. **Performance**: Indexed queries are fast
7. **Security**: RLS ensures users can't manipulate others' data

**The chat system is production-ready and will work reliably!**

---

## 📦 Deployment Guide

### Prerequisites:
1. Vercel account
2. Supabase account
3. GitHub repository (optional but recommended)

### Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for project to be created (2-3 minutes)
3. Go to **Settings → API** and copy:
   - Project URL
   - anon public key
   - service_role secret key
4. Go to **SQL Editor** and run the **MASTER_DATABASE_SCHEMA.sql** file
5. Go to **Storage** and create a bucket called `profile-pictures` (set to public)

### Step 2: Configure Environment Variables

In your Vercel project or `.env.local`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### Step 3: Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables
6. Click "Deploy"

### Step 4: Post-Deployment

1. Test authentication (signup/login)
2. Test games (spin, quiz, impostor)
3. Test chat (send messages)
4. Test verification system
5. Check leaderboard updates

---

## 🎯 Game Mechanics

### Points System:

| Action | Points Change | EXP Earned |
|--------|--------------|------------|
| Signup | +1000 | 0 |
| Referral (both users) | +200 | 0 |
| Spin (cost) | -50 | 0 |
| Spin Win (3 match) | +150-450 | +20 |
| Spin Win (2 match) | +50-150 | +20 |
| Spin Loss | -50 | +5 |
| Quiz Correct | +30-60 | +10 |
| Quiz Incorrect | 0 | 0 |
| Impostor Win | +50-100 | +20 |
| Impostor Loss | 0 | +5 |
| Chat Message | 0 | +5 |
| Verification | 0 | +50 |

### Level Progression:

| Level | EXP Required | Total EXP |
|-------|-------------|-----------|
| 1 | 0 | 0 |
| 2 | 100 | 100 |
| 3 | 100 | 200 |
| 4 | 100 | 300 |
| 5 | 100 | 400 |
| 6 | 100 | 500 |
| 7 | 100 | 600 |
| 8 | 100 | 700 |
| 9 | 100 | 800 |
| 10 (MAX) | 100 | 900 |

---

## 🏗️ Technical Architecture

### Frontend Structure:
\`\`\`
app/
├── auth/
│   ├── login/
│   ├── sign-up/
│   └── sign-up-success/
├── dashboard/
├── games/
│   ├── spin/
│   ├── quiz/
│   └── impostor/
├── leaderboard/
├── chat/
├── verification/
├── notifications/
├── profile/
└── acknowledgements/

components/
├── ui/ (shadcn components)
├── dashboard-client.jsx
├── spin-game.jsx
├── quiz-game.jsx
├── impostor-game.jsx
├── leaderboard-client.jsx
├── community-chat-client.jsx
├── verification-client.jsx
├── notifications-client.jsx
├── profile-edit-client.jsx
└── page-navigation.jsx

lib/
├── supabase/
│   ├── client.js
│   ├── server.js
│   └── middleware.js
├── sounds.js
└── utils.ts
\`\`\`

### Database Functions Flow:
\`\`\`
User Action → Client Component → Supabase RPC → Database Function → Trigger → Update Tables → Realtime Broadcast → UI Update
\`\`\`

### Security Layers:
1. **Authentication**: Supabase Auth
2. **Authorization**: Row Level Security (RLS)
3. **Validation**: Client-side + Server-side
4. **Rate Limiting**: Database functions
5. **Moderation**: Banned words + Link filtering
6. **Data Protection**: No sensitive data stored

---

## 🎉 Conclusion

The Billions Gaming Hub is a **complete, production-ready gaming platform** with:

- ✅ Full authentication system
- ✅ Multiple games with points/EXP rewards
- ✅ Social features (chat, leaderboard)
- ✅ Referral system
- ✅ Verification system
- ✅ Notification system
- ✅ Mobile responsive design
- ✅ Comprehensive database schema
- ✅ Row Level Security
- ✅ Real-time updates
- ✅ Scalable architecture

**Everything is handled by the MASTER_DATABASE_SCHEMA.sql file** - one SQL script to rule them all!

The platform is ready to deploy and can handle thousands of concurrent users with Supabase's infrastructure.

---

**Built with ❤️ for the Billions Network community**

Contributors:
- **Hizzy** 💙 - Project Advisor and Contributor
- **Dvm** 💙 - Project Core Contributor
- **Big_D** 💙 - Project Core Contributor
