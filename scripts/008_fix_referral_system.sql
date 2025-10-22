-- ============================================
-- FIX REFERRAL SYSTEM - Ensure proper bonus application
-- ============================================

-- Drop and recreate the apply_referral_bonus function with better error handling
DROP FUNCTION IF EXISTS public.apply_referral_bonus(UUID, TEXT);

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
  referee_points INTEGER;
  referrer_points INTEGER;
BEGIN
  -- Find referrer by code (case-insensitive)
  SELECT id INTO referrer_id
  FROM public.profiles
  WHERE LOWER(referral_code) = LOWER(referrer_code);
  
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
  
  -- Update referee with 200 bonus points
  UPDATE public.profiles
  SET 
    referred_by = referrer_id,
    total_points = total_points + 200,
    referral_bonus_claimed = true,
    updated_at = NOW()
  WHERE id = referee_id
  RETURNING total_points INTO referee_points;
  
  -- Update referrer with 200 bonus points and increment referral count
  UPDATE public.profiles
  SET 
    total_points = total_points + 200,
    referral_count = referral_count + 1,
    updated_at = NOW()
  WHERE id = referrer_id
  RETURNING total_points INTO referrer_points;
  
  -- Create notifications for both users
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES 
    (referee_id, 'referral', 'Referral Bonus Received!', 'You earned 200 points from using a referral code!'),
    (referrer_id, 'referral', 'New Referral!', 'Someone used your referral code! You earned 200 points!');
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Referral bonus applied successfully',
    'referee_new_points', referee_points,
    'referrer_new_points', referrer_points
  );
END;
$$;

-- Create index for faster referral lookups (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code_lower ON public.profiles(LOWER(referral_code));

-- Verify referral system is working by checking existing referrals
-- This query shows all users who have used referral codes
SELECT 
  p.id,
  p.username,
  p.total_points,
  p.referral_count,
  p.referred_by,
  referrer.username as referred_by_username
FROM public.profiles p
LEFT JOIN public.profiles referrer ON p.referred_by = referrer.id
WHERE p.referred_by IS NOT NULL
ORDER BY p.created_at DESC;
