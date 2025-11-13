-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'campaign_creator', 'donor');

-- Create campaign_status enum
CREATE TYPE public.campaign_status AS ENUM ('draft', 'pending', 'active', 'completed', 'suspended', 'rejected');

-- Create campaign_category enum
CREATE TYPE public.campaign_category AS ENUM ('education', 'healthcare', 'business', 'community', 'emergency');

-- Create payment_status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'successful', 'failed', 'refunded');

-- Create withdrawal_status enum
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'rejected');

-- Create report_status enum
CREATE TYPE public.report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  location_state TEXT,
  location_lga TEXT,
  bio TEXT,
  verified_status BOOLEAN DEFAULT FALSE,
  bvn_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES public.profiles(id),
  UNIQUE (user_id, role)
);

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  story TEXT NOT NULL,
  category public.campaign_category NOT NULL,
  goal_amount NUMERIC NOT NULL CHECK (goal_amount > 0),
  current_amount NUMERIC DEFAULT 0 CHECK (current_amount >= 0),
  currency TEXT DEFAULT 'NGN',
  image_url TEXT,
  video_url TEXT,
  location_state TEXT NOT NULL,
  location_lga TEXT,
  status public.campaign_status DEFAULT 'draft',
  verified BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verification_documents JSONB DEFAULT '[]'::jsonb,
  bank_details JSONB
);

-- Create donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'NGN',
  payment_reference TEXT UNIQUE NOT NULL,
  payment_status public.payment_status DEFAULT 'pending',
  payment_method TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paystack_reference TEXT
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  status public.withdrawal_status DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES public.profiles(id),
  notes TEXT
);

-- Create campaign_updates table
CREATE TABLE public.campaign_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_comments table
CREATE TABLE public.campaign_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  moderated BOOLEAN DEFAULT FALSE
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reported_type TEXT NOT NULL,
  reported_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status public.report_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for campaigns
CREATE POLICY "Active campaigns are viewable by everyone"
  ON public.campaigns FOR SELECT
  USING (status = 'active' OR creator_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Authenticated users can create campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = creator_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete campaigns"
  ON public.campaigns FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for donations
CREATE POLICY "Donors can view their own donations"
  ON public.donations FOR SELECT
  USING (auth.uid() = donor_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Campaign creators can view donations to their campaigns"
  ON public.donations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = donations.campaign_id
      AND campaigns.creator_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create donations"
  ON public.donations FOR INSERT
  WITH CHECK (true);

-- RLS Policies for withdrawals
CREATE POLICY "Creators can view their own withdrawals"
  ON public.withdrawals FOR SELECT
  USING (auth.uid() = creator_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Creators can request withdrawals"
  ON public.withdrawals FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Admins can update withdrawals"
  ON public.withdrawals FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for campaign_updates
CREATE POLICY "Updates are viewable by everyone"
  ON public.campaign_updates FOR SELECT
  USING (true);

CREATE POLICY "Creators can add updates to their campaigns"
  ON public.campaign_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_updates.campaign_id
      AND campaigns.creator_id = auth.uid()
    )
  );

-- RLS Policies for campaign_comments
CREATE POLICY "Comments are viewable by everyone"
  ON public.campaign_comments FOR SELECT
  USING (moderated = true OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Authenticated users can comment"
  ON public.campaign_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.campaign_comments FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Users can delete their own comments"
  ON public.campaign_comments FOR DELETE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'moderator'));

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins and moderators can update reports"
  ON public.reports FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', '')
  );
  
  -- Assign default donor role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'donor');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();