
-- Create enums
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'entrepreneur', 'investor');
CREATE TYPE public.opportunity_status AS ENUM ('draft', 'pending_review', 'published', 'rejected', 'funded');
CREATE TYPE public.offer_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

-- Profiles table: Stores basic user details and links to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role public.app_role DEFAULT 'entrepreneur'::public.app_role,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Opportunities table: Investment opportunities posted by entrepreneurs
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrepreneur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount_sought NUMERIC(18, 2) NOT NULL,
  expected_roi NUMERIC(5, 2),
  industry TEXT,
  status public.opportunity_status DEFAULT 'draft'::public.opportunity_status,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Offers table: Investor interest/offers on opportunities
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(18, 2) NOT NULL,
  status public.offer_status DEFAULT 'pending'::public.offer_status,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Function to update 'updated_at' column
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to get current user's role for RLS
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Trigger to auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    CASE
      WHEN NEW.email IN ('superadmin@abathwacapital.com') THEN 'super_admin'::public.app_role
      WHEN NEW.email IN ('admin1@abathwacapital.com') THEN 'admin'::public.app_role
      ELSE 'entrepreneur'::public.app_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the handle_new_user trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for opportunities
CREATE POLICY "Entrepreneurs can manage their opportunities" ON public.opportunities
  FOR ALL USING (entrepreneur_id = auth.uid());

CREATE POLICY "Investors can view published opportunities" ON public.opportunities
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all opportunities" ON public.opportunities
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for offers
CREATE POLICY "Investors can create their own offers" ON public.offers
  FOR INSERT WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Investors can manage their own offers" ON public.offers
  FOR ALL USING (investor_id = auth.uid());

CREATE POLICY "Entrepreneurs can view offers on their opportunities" ON public.offers
  FOR SELECT USING (opportunity_id IN (SELECT id FROM public.opportunities WHERE entrepreneur_id = auth.uid()));

CREATE POLICY "Admins can manage all offers" ON public.offers
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));
