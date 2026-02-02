-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'coach', 'athlete')) DEFAULT 'athlete',
    age_category TEXT,
    weight_class TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. EVENTS TABLE
CREATE TABLE public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    target_category TEXT,
    visibility_ids UUID[] -- If null, public. If set, only specific user IDs.
);

-- 3. REGISTRATIONS TABLE
CREATE TABLE public.registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('yes', 'no', 'pending')) DEFAULT 'pending',
    declared_weight TEXT,
    UNIQUE(event_id, profile_id)
);

-- 4. RESULTS TABLE
CREATE TABLE public.results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    medal TEXT CHECK (medal IN ('gold', 'silver', 'bronze', 'none')) DEFAULT 'none',
    athlete_comment TEXT,
    UNIQUE(event_id, profile_id)
);

-- RLS POLICIES

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone if public or user in list" ON public.events
    FOR SELECT USING (
        visibility_ids IS NULL OR 
        auth.uid() = ANY(visibility_ids) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
CREATE POLICY "Coaches and Admins can create events" ON public.events
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
CREATE POLICY "Coaches and Admins can update events" ON public.events
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );

-- Registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own registrations" ON public.registrations FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Coaches can view all registrations" ON public.registrations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
CREATE POLICY "Users can register themselves" ON public.registrations FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update own registration" ON public.registrations FOR UPDATE USING (auth.uid() = profile_id);

-- Results
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Viewable by everyone" ON public.results FOR SELECT USING (true);
CREATE POLICY "Coaches can insert/update results" ON public.results FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
CREATE POLICY "Athletes can update their own comment" ON public.results FOR UPDATE USING (
    auth.uid() = profile_id
) WITH CHECK (
    auth.uid() = profile_id
);

-- Trigger to create profile on sign up (Optional, but good practice)
-- create function and trigger would go here if needed to auto-create profile from auth.users
