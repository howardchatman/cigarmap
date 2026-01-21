-- ============================================
-- CIGARMAP DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 2. Create cities table if not exists
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  hero_image TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create subscription_plans table if not exists
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create lounges table if not exists
CREATE TABLE IF NOT EXISTS lounges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  description TEXT,
  lounge_type TEXT CHECK (lounge_type IN ('Lounge', 'Bar', 'Retail', 'Private Club')),
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_claimed BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  subscription_plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'active', 'canceled', 'past_due')),
  subscription_ends_at TIMESTAMPTZ,
  -- Social media columns
  instagram TEXT,
  facebook TEXT,
  twitter TEXT,
  tiktok TEXT,
  cover_image TEXT,
  wants_website BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create subscriptions table if not exists
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lounge_id UUID REFERENCES lounges(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create payments table if not exists
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lounge_id UUID REFERENCES lounges(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create activity_logs table if not exists
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create storage buckets for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('businesses', 'businesses', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Storage policies for profiles bucket
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own avatar') THEN
    CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own avatar') THEN
    CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatar images are publicly accessible') THEN
    CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'profiles');
  END IF;
END $$;

-- 10. Storage policies for businesses bucket
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload business images') THEN
    CREATE POLICY "Authenticated users can upload business images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'businesses' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own business images') THEN
    CREATE POLICY "Users can update their own business images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'businesses' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Business images are publicly accessible') THEN
    CREATE POLICY "Business images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'businesses');
  END IF;
END $$;

-- 11. RLS Policies for tables
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lounges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Cities: Public read
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Cities are viewable by everyone') THEN
    CREATE POLICY "Cities are viewable by everyone" ON cities FOR SELECT USING (true);
  END IF;
END $$;

-- Subscription plans: Public read
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Subscription plans are viewable by everyone') THEN
    CREATE POLICY "Subscription plans are viewable by everyone" ON subscription_plans FOR SELECT USING (true);
  END IF;
END $$;

-- Lounges: Public read, owner can update
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lounges are viewable by everyone') THEN
    CREATE POLICY "Lounges are viewable by everyone" ON lounges FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own lounges') THEN
    CREATE POLICY "Users can insert their own lounges" ON lounges FOR INSERT WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own lounges') THEN
    CREATE POLICY "Users can update their own lounges" ON lounges FOR UPDATE USING (auth.uid() = owner_id);
  END IF;
END $$;

-- Profiles: Users can update own profile
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- 12. Insert subscription plans
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, features, is_active) VALUES
('Basic', 'basic', 0, 0, '["Business name & address listed", "Contact info (phone, website)", "Lounge type & basic amenities", "Appear in city search results"]', true),
('Pro', 'pro', 4900, 49000, '["Everything in Basic", "Verified badge", "Full description & photos (up to 10)", "Hours of operation", "Social media links", "Priority in search results", "Monthly analytics dashboard"]', true),
('Premium', 'premium', 9900, 99000, '["Everything in Pro", "AI-Powered Social Posts", "AI Event Description Generator", "Featured badge + homepage placement", "Unlimited photos", "Events & promotions posting", "Featured in city pages", "Advanced analytics dashboard", "Direct messaging from users", "Priority customer support"]', true)
ON CONFLICT (slug) DO UPDATE SET
  features = EXCLUDED.features,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly;

-- 13. Insert some initial cities
INSERT INTO cities (name, slug, description, is_featured) VALUES
('Houston', 'houston', 'Discover the best cigar lounges in Houston, Texas', true),
('Dallas', 'dallas', 'Explore premium cigar spots in Dallas, Texas', true),
('Austin', 'austin', 'Find top cigar lounges in Austin, Texas', true),
('Miami', 'miami', 'Experience the cigar culture in Miami, Florida', true),
('New York', 'new-york', 'The finest cigar lounges in New York City', true),
('Los Angeles', 'los-angeles', 'Premium cigar destinations in Los Angeles', true)
ON CONFLICT (slug) DO NOTHING;
