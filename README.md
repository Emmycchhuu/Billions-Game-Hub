# 🎮 Billions Gaming Hub

A futuristic cyberpunk-themed gaming platform featuring three interactive games with real-time leaderboards and user authentication.

## 🎯 Features

- **Find the Impostor**: Identify AI impostors among verified humans using character ID cards
- **Billions Spin**: Slot machine game with emoji symbols and prize multipliers
- **Billions Quiz**: Rapid-fire trivia game with time-based scoring
- **Global Leaderboard**: Compete with players worldwide
- **User Authentication**: Secure sign up and login with Supabase
- **Points System**: Earn points across all games and track your progress

## 🚀 Quick Start (v0 Preview)

The app is already configured and ready to use in v0! Just run the database setup:

1. Click the "Run" button on the `scripts/001_create_tables.sql` file in the Scripts panel
2. Navigate to `/auth/sign-up` to create an account
3. Start playing games and earning points!

## 📦 Deploy to Your Own Hosting

### Prerequisites

- A Supabase account (free tier works great)
- A hosting platform (Vercel, Netlify, etc.)

### Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your database to be provisioned
3. Go to Project Settings → API
4. Copy your:
   - Project URL (looks like `https://xxxxx.supabase.co`)
   - Anon/Public Key (starts with `eyJ...`)

### Step 2: Run Database Setup

1. In your Supabase dashboard, go to SQL Editor
2. Copy the contents of `scripts/001_create_tables.sql`
3. Paste and run the SQL script
4. This creates the necessary tables: `profiles`, `game_sessions`, and `leaderboard`

### Step 3: Deploy Your App

#### Option A: Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   \`\`\`
4. Deploy!

#### Option B: Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and import your repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables in Site Settings → Environment Variables
5. Deploy!

#### Option C: Other Hosting Platforms

Any platform that supports Next.js will work. Just ensure you:
1. Set the environment variables
2. Use Node.js 18+ runtime
3. Configure the build command: `npm run build`
4. Set the start command: `npm start`

### Step 4: Configure Email (Optional)

For email verification and password resets:

1. In Supabase dashboard, go to Authentication → Email Templates
2. Customize your email templates
3. Go to Authentication → URL Configuration
4. Set your Site URL to your deployed domain
5. Add your domain to Redirect URLs

## 🎮 How to Play

### Find the Impostor
- View 6 character ID cards
- Identify which one is the AI impostor
- Faster correct answers = more points (50-100 pts)
- 30 seconds per round

### Billions Spin
- Spin the slot machine (5 spins per game)
- Match 2 or 3 symbols to win
- Prizes range from 10-500 points
- Different symbols have different values

### Billions Quiz
- Answer 10 trivia questions
- 10 seconds per question
- Faster answers earn bonus points
- Track your accuracy percentage

## 🏆 Leaderboard

- Global rankings updated in real-time
- View top 100 players
- See your personal rank
- Track your game history

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui

## 📁 Project Structure

\`\`\`
billions-gaming-hub/
├── app/
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main game selection
│   ├── games/            # Individual game pages
│   │   ├── impostor/
│   │   ├── spin/
│   │   └── quiz/
│   ├── leaderboard/      # Rankings and stats
│   └── page.jsx          # Landing page
├── components/           # Reusable components
├── lib/
│   ├── supabase/        # Supabase client configs
│   └── sounds.js        # Sound effects utility
├── scripts/             # Database setup scripts
└── public/              # Static assets
\`\`\`

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only modify their own data
- Secure authentication with Supabase
- Environment variables for sensitive data

## 🎨 Customization

### Colors
Edit `app/globals.css` to change the color scheme:
- `--primary`: Main brand color (cyan)
- `--secondary`: Accent color (magenta)
- `--accent`: Highlight color (purple)

### Games
- Add new questions in `components/quiz-game.jsx`
- Modify slot symbols in `components/spin-game.jsx`
- Add character cards in `components/impostor-game.jsx`

### Points
Adjust point values in each game component:
- Impostor: 50-100 points
- Spin: 10-500 points
- Quiz: 10-30 points per question

## 🐛 Troubleshooting

**"Supabase credentials not found"**
- Ensure environment variables are set correctly
- Check that variable names match exactly
- Restart your development server

**"Table does not exist"**
- Run the SQL setup script in Supabase
- Check that all tables were created successfully

**Authentication not working**
- Verify your Supabase URL and keys
- Check that email confirmation is disabled (or configure email)
- Ensure redirect URLs are configured

## 📝 License

MIT License - feel free to use this project however you'd like!

## 🤝 Contributing

This is a v0 project. Feel free to fork and customize for your own use!

---

Built with ❤️ using v0 by Vercel
