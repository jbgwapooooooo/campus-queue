-- Run this script in your Supabase SQL Editor

-- 1. Create a `queue_entries` table to handle people joining queues
CREATE TABLE IF NOT EXISTS public.queue_entries (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    service_id INT NOT NULL, -- Assuming service IDs match your Dashboard services
    status TEXT DEFAULT 'waiting', -- 'waiting', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own entries
CREATE POLICY "Users can insert own queue entries" 
    ON public.queue_entries FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Allow anyone to read queue entries
CREATE POLICY "Anyone can read queue entries" 
    ON public.queue_entries FOR SELECT 
    USING (true);

-- Allow admins to update queue entries
CREATE POLICY "Admins can update queue entries"
    ON public.queue_entries FOR UPDATE
    USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- 2. Note on Avatars Bucket:
-- You MUST create a Storage bucket named 'avatars' from the Supabase Dashboard manually.
-- Go to Storage -> Create a new bucket -> Name it 'avatars'.
-- Make sure to set the bucket to "Public".
