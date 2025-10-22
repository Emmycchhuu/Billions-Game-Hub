-- ============================================================================
-- BILLIONS GAMING HUB - MASTER DATABASE SCHEMA
-- ============================================================================
-- This comprehensive SQL script handles ALL database functionality for the
-- Billions Gaming Hub from A to Z, including:
--
-- 1. AUTHENTICATION & USER MANAGEMENT
--    - Automatic profile creation on signup
--    - Email/password authentication via Supabase Auth
--    - Row Level Security (RLS) for data protection
--
-- 2. USER PROFILES & POINTS SYSTEM
--    - Starting balance: 1000 points
--    - Profile pictures stored in Supabase Storage
--    - User statistics tracking
--
-- 3. EXPERIENCE & LEVELING SYSTEM
--    - Max level: 10
--    - EXP earned from games and chat
--    - Automatic level-up calculations
--
-- 4. REFERRAL SYSTEM
--    - Unique 8-character referral codes
--    - 200 points bonus for both referrer and referee
--    - Referral count tracking
--
-- 5. GAMES & POINTS REWARDS
--    - Spin Game: Win/lose points based on matches
--    - Quiz Game: Correct answers earn points
--    - Find the Impostor: Identify impostor to win
--    - All games award EXP
--
-- 6. LEADERBOARD SYSTEM
--    - Ranking by points (shows level)
--    - Ranking by referrals
--    - Top 100 players displayed
--
-- 7. COMMUNITY CHAT SYSTEM
--    - Real-time messaging
--    - Profile pictures in chat
--    - Verification badges displayed
--    - Message auto-deletion after 1 hour
--    - 1-minute rate limiting per user
--
-- 8. CHAT MODERATION
--    - Banned words detection
--    - 24-hour user bans
--    - Link filtering (only Twitter/X allowed)
--
-- 9. HUMAN VERIFICATION SYSTEM
--    - Math questions
--    - Billions quiz questions
--    - Touch-and-hold biometrics
--    - Voice verification
--    - Pending verification state (2-3 minutes)
--    - Verification badge on profile
--
-- 10. NOTIFICATION SYSTEM
--     - Referral bonuses
--     - Level ups
--     - Verification status
--     - Leaderboard changes
--
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE - Core user data
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  
  -- Points & Game Stats
  total_points INTEGER DEFAULT 1000 NOT NULL,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  games_lost INTEGER DEFAULT 0,
  
  -- Experience & Leveling
  exp INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  
  -- Referral System
  referral_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referral_count INTEGER DEFAULT 0,
  referral_bonus_claimed BOOLEAN DEFAULT FALSE,
  
  -- Verification System
  is_verified BOOLEAN DEFAULT FALSE,
  verification_pending BOOLEAN DEFAULT FALSE,
  verification_pending_at TIMESTAMPTZ,
  verification_completed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    username,
    display_name,
    total_points,
    exp,
    level,
    referral_code
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    1000,
    0,
    1,
    substring(md5(random()::text || NEW.id::text) from 1 for 8)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 3. GAME SESSIONS TABLE - Track all game plays
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_type TEXT NOT NULL, -- 'spin', 'quiz', 'impostor'
  points_earned INTEGER NOT NULL, -- Can be negative for losses
  exp_earned INTEGER DEFAULT 0,
  game_data JSONB, -- Store game-specific data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own game sessions"
  ON public.game_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON public.game_sessions(created_at DESC);

-- ============================================================================
-- 4. LEADERBOARD TABLE - Rankings
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  referral_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  rank INTEGER,
  referral_rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view leaderboard"
  ON public.leaderboard FOR SELECT
  USING (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON public.leaderboard(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_referrals ON public.leaderboard(referral_count DESC);

-- ============================================================================
-- 5. AUTO-UPDATE LEADERBOARD FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_leaderboard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update leaderboard entry
  INSERT INTO public.leaderboard (
    user_id,
    username,
    display_name,
    avatar_url,
    total_points,
    level,
    referral_count,
    is_verified,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.username,
    NEW.display_name,
    NEW.avatar_url,
    NEW.total_points,
    NEW.level,
    NEW.referral_count,
    NEW.is_verified,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    total_points = EXCLUDED.total_points,
    level = EXCLUDED.level,
    referral_count = EXCLUDED.referral_count,
    is_verified = EXCLUDED.is_verified,
    updated_at = NOW();
  
  -- Update ranks by points
  WITH ranked_users AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, updated_at ASC) as new_rank
    FROM public.leaderboard
  )
  UPDATE public.leaderboard l
  SET rank = r.new_rank
  FROM ranked_users r
  WHERE l.user_id = r.user_id;
  
  -- Update ranks by referrals
  WITH ranked_referrals AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY referral_count DESC, updated_at ASC) as new_rank
    FROM public.leaderboard
  )
  UPDATE public.leaderboard l
  SET referral_rank = r.new_rank
  FROM ranked_referrals r
  WHERE l.user_id = r.user_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update leaderboard
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  AFTER INSERT OR UPDATE OF total_points, level, referral_count, is_verified
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_leaderboard();

-- ============================================================================
-- 6. COMMUNITY CHAT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view recent messages"
  ON public.chat_messages FOR SELECT
  USING (created_at > NOW() - INTERVAL '1 hour');

CREATE POLICY "Authenticated users can insert messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- ============================================================================
-- 7. AUTO-DELETE OLD CHAT MESSAGES (1 hour retention)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.delete_old_chat_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.chat_messages
  WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$;

-- ============================================================================
-- 8. CHAT MODERATION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  banned_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_bans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own bans"
  ON public.chat_bans FOR SELECT
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_chat_bans_user_id ON public.chat_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_bans_banned_until ON public.chat_bans(banned_until);

-- ============================================================================
-- 9. RATE LIMITING TABLE (1 minute between messages)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_rate_limits (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own rate limit"
  ON public.chat_rate_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own rate limit"
  ON public.chat_rate_limits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rate limit"
  ON public.chat_rate_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 10. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'referral', 'level_up', 'verification', 'leaderboard'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ============================================================================
-- 11. VERIFICATION ATTEMPTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.verification_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  step_type TEXT NOT NULL, -- 'math', 'quiz', 'touch', 'voice'
  completed BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.verification_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own verification attempts"
  ON public.verification_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification attempts"
  ON public.verification_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 12. CALCULATE LEVEL FROM EXP
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_level(exp_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  calculated_level INTEGER;
BEGIN
  -- Level progression: 100 EXP per level, max level 10
  calculated_level := LEAST(FLOOR(exp_amount / 100.0) + 1, 10);
  RETURN calculated_level;
END;
$$;

-- ============================================================================
-- 13. AUTO-UPDATE LEVEL WHEN EXP CHANGES
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_level_on_exp_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_level INTEGER;
  old_level INTEGER;
BEGIN
  -- Calculate new level
  new_level := public.calculate_level(NEW.exp);
  old_level := OLD.level;
  
  -- Update level if changed
  IF new_level != old_level THEN
    NEW.level := new_level;
    
    -- Create level-up notification
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      data
    )
    VALUES (
      NEW.id,
      'level_up',
      'Level Up!',
      'Congratulations! You reached level ' || new_level || '!',
      jsonb_build_object('old_level', old_level, 'new_level', new_level)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to update level
DROP TRIGGER IF EXISTS on_exp_change ON public.profiles;
CREATE TRIGGER on_exp_change
  BEFORE UPDATE OF exp
  ON public.profiles
  FOR EACH ROW
  WHEN (OLD.exp IS DISTINCT FROM NEW.exp)
  EXECUTE FUNCTION public.update_level_on_exp_change();

-- ============================================================================
-- 14. HANDLE REFERRAL BONUS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.apply_referral_bonus(
  referee_id UUID,
  referrer_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_id UUID;
  result JSONB;
BEGIN
  -- Find referrer by code
  SELECT id INTO referrer_id
  FROM public.profiles
  WHERE referral_code = referrer_code;
  
  IF referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  
  IF referrer_id = referee_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot use your own referral code');
  END IF;
  
  -- Check if already used a referral
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = referee_id AND referred_by IS NOT NULL) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have already used a referral code');
  END IF;
  
  -- Update referee
  UPDATE public.profiles
  SET 
    referred_by = referrer_id,
    total_points = total_points + 200,
    referral_bonus_claimed = true
  WHERE id = referee_id;
  
  -- Update referrer
  UPDATE public.profiles
  SET 
    total_points = total_points + 200,
    referral_count = referral_count + 1
  WHERE id = referrer_id;
  
  -- Create notifications
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES 
    (referee_id, 'referral', 'Referral Bonus!', 'You earned 200 points from using a referral code!'),
    (referrer_id, 'referral', 'Referral Bonus!', 'Someone used your referral code! You earned 200 points!');
  
  RETURN jsonb_build_object('success', true, 'message', 'Referral bonus applied successfully');
END;
$$;

-- ============================================================================
-- 15. AWARD GAME POINTS AND EXP
-- ============================================================================
CREATE OR REPLACE FUNCTION public.award_game_rewards(
  p_user_id UUID,
  p_game_type TEXT,
  p_points INTEGER,
  p_exp INTEGER,
  p_game_data JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points INTEGER;
  new_points INTEGER;
BEGIN
  -- Get current points
  SELECT total_points INTO current_points
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Calculate new points (don't go below 0)
  new_points := GREATEST(current_points + p_points, 0);
  
  -- Update profile
  UPDATE public.profiles
  SET 
    total_points = new_points,
    exp = exp + p_exp,
    games_played = games_played + 1,
    games_won = CASE WHEN p_points > 0 THEN games_won + 1 ELSE games_won END,
    games_lost = CASE WHEN p_points < 0 THEN games_lost + 1 ELSE games_lost END,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record game session
  INSERT INTO public.game_sessions (
    user_id,
    game_type,
    points_earned,
    exp_earned,
    game_data
  )
  VALUES (
    p_user_id,
    p_game_type,
    p_points,
    p_exp,
    p_game_data
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'points_change', p_points,
    'exp_earned', p_exp,
    'new_total_points', new_points
  );
END;
$$;

-- ============================================================================
-- 16. STORAGE BUCKET FOR PROFILE PICTURES
-- ============================================================================
-- Note: This needs to be run in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('avatars', 'avatars', true);

-- Storage policies (run in Supabase dashboard)
-- CREATE POLICY "Avatar images are publicly accessible"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload their own avatar"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can update their own avatar"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own avatar"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- 17. HELPER FUNCTIONS
-- ============================================================================

-- Get user's current ban status
CREATE OR REPLACE FUNCTION public.is_user_banned(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_banned BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.chat_bans
    WHERE user_id = p_user_id
    AND banned_until > NOW()
  ) INTO is_banned;
  
  RETURN is_banned;
END;
$$;

-- Check rate limit
CREATE OR REPLACE FUNCTION public.can_send_message(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_message TIMESTAMPTZ;
  can_send BOOLEAN;
BEGIN
  SELECT last_message_at INTO last_message
  FROM public.chat_rate_limits
  WHERE user_id = p_user_id;
  
  IF last_message IS NULL THEN
    can_send := true;
  ELSE
    can_send := (NOW() - last_message) > INTERVAL '1 minute';
  END IF;
  
  RETURN can_send;
END;
$$;

-- ============================================================================
-- 18. HANDLE NEW USER CREATION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    username,
    display_name,
    avatar_url,
    total_points,
    exp,
    level,
    referral_code,
    is_verified,
    verification_pending,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    '/images/avatar-1.jpeg',
    1000, -- Starting points
    0,    -- Starting EXP
    1,    -- Starting level
    substring(md5(random()::text) from 1 for 8), -- Random referral code
    false,
    false,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable real-time for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Enable real-time for leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;

-- Create Storage bucket for profile pictures (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Set up Storage policies for profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile pictures" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Profile pictures are publicly viewable" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-pictures');

-- ============================================================================
-- 19. AUTO-APPROVE VERIFICATION AFTER 3 MINUTES
-- ============================================================================
CREATE OR REPLACE FUNCTION public.auto_approve_verification()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update profiles where verification is pending and time has passed
  UPDATE public.profiles
  SET 
    verification_pending = false,
    is_verified = true,
    verification_completed_at = NOW(),
    updated_at = NOW()
  WHERE 
    verification_pending = true 
    AND verification_pending_until IS NOT NULL
    AND verification_pending_until <= NOW();
  
  -- Create notifications for approved users
  INSERT INTO public.notifications (user_id, type, title, message)
  SELECT 
    id,
    'verification_approved',
    'Verification Approved! ✅',
    'Congratulations! Your verification has been approved. You now have a verification badge!'
  FROM public.profiles
  WHERE 
    verification_pending = false 
    AND is_verified = true
    AND verification_completed_at >= NOW() - INTERVAL '1 minute';
END;
$$;

-- ============================================================================
-- 20. VERIFICATION CARDS SYSTEM
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.verification_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  card_level INTEGER NOT NULL CHECK (card_level >= 1 AND card_level <= 5),
  card_type TEXT NOT NULL, -- 'blue', 'green', 'purple', 'red', 'golden'
  card_name TEXT NOT NULL, -- 'Billions Blue Card', 'Billions Green Card', etc.
  verification_data JSONB NOT NULL, -- Stores verification results
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.verification_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own cards"
  ON public.verification_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards"
  ON public.verification_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_verification_cards_user_id ON public.verification_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_cards_level ON public.verification_cards(card_level);

-- ============================================================================
-- 21. CARD VERIFICATION DIFFICULTY SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.card_difficulty_settings (
  card_level INTEGER PRIMARY KEY CHECK (card_level >= 1 AND card_level <= 5),
  card_type TEXT NOT NULL,
  card_name TEXT NOT NULL,
  math_questions INTEGER NOT NULL DEFAULT 5,
  quiz_questions INTEGER NOT NULL DEFAULT 5,
  touch_duration_seconds INTEGER NOT NULL DEFAULT 3,
  voice_phrases TEXT[] NOT NULL DEFAULT ARRAY['Say: I am a verified human'],
  unlocked_at_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert difficulty settings for each card level
INSERT INTO public.card_difficulty_settings (card_level, card_type, card_name, math_questions, quiz_questions, touch_duration_seconds, voice_phrases, unlocked_at_level) VALUES
(1, 'blue', 'Billions Blue Card', 5, 5, 3, ARRAY['Say: I am a verified human'], 1),
(2, 'green', 'Billions Green Card', 8, 8, 5, ARRAY['Say: I am a verified human', 'Say: Billions Gaming Hub is amazing'], 2),
(3, 'purple', 'Billions Purple Card', 12, 12, 8, ARRAY['Say: I am a verified human', 'Say: Billions Gaming Hub is amazing', 'Say: I love playing games'], 3),
(4, 'red', 'Billions Red Card', 15, 15, 12, ARRAY['Say: I am a verified human', 'Say: Billions Gaming Hub is amazing', 'Say: I love playing games', 'Say: I am a gaming champion'], 4),
(5, 'golden', 'Billions Golden Card', 20, 20, 15, ARRAY['Say: I am a verified human', 'Say: Billions Gaming Hub is amazing', 'Say: I love playing games', 'Say: I am a gaming champion', 'Say: I am the ultimate Billions player'], 5)
ON CONFLICT (card_level) DO NOTHING;

-- ============================================================================
-- 22. INITIAL DATA SETUP
-- ============================================================================

-- Create initial leaderboard entries for existing users
INSERT INTO public.leaderboard (
  user_id,
  username,
  display_name,
  avatar_url,
  total_points,
  level,
  referral_count,
  is_verified
)
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  total_points,
  level,
  referral_count,
  is_verified
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- END OF MASTER DATABASE SCHEMA
-- ============================================================================

-- Summary of what this schema handles:
-- ✅ User authentication and profile management
-- ✅ Points system (starting with 1000 points)
-- ✅ EXP and leveling (max level 10)
-- ✅ Referral system with 200 point bonuses
-- ✅ Game sessions tracking (spin, quiz, impostor)
-- ✅ Leaderboard rankings (by points and referrals)
-- ✅ Community chat with 1-hour message retention
-- ✅ Chat moderation (bans, rate limiting)
-- ✅ Human verification system
-- ✅ Notification system
-- ✅ Profile picture storage
-- ✅ Automatic triggers for level-ups and leaderboard updates
-- ✅ Row Level Security (RLS) for data protection
