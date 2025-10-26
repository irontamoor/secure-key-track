-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table (separate from profiles to prevent privilege escalation)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create security definer function to check roles (prevents RLS recursion)
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
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Add database constraints for input validation
ALTER TABLE public.bookings
  ADD CONSTRAINT user_name_length CHECK (length(user_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT given_to_length CHECK (given_to IS NULL OR length(given_to) BETWEEN 1 AND 100),
  ADD CONSTRAINT notes_length CHECK (notes IS NULL OR length(notes) <= 1000);

ALTER TABLE public.keys
  ADD CONSTRAINT key_number_length CHECK (length(key_number) BETWEEN 1 AND 50),
  ADD CONSTRAINT description_length CHECK (length(description) BETWEEN 1 AND 500),
  ADD CONSTRAINT location_length CHECK (location IS NULL OR length(location) <= 200),
  ADD CONSTRAINT notes_length CHECK (additional_notes IS NULL OR length(additional_notes) <= 1000);

-- DROP existing permissive policies on keys table
DROP POLICY IF EXISTS "Allow public delete to keys" ON public.keys;
DROP POLICY IF EXISTS "Allow public insert to keys" ON public.keys;
DROP POLICY IF EXISTS "Allow public read access to keys" ON public.keys;
DROP POLICY IF EXISTS "Allow public update to keys" ON public.keys;

-- CREATE secure RLS policies for keys table
CREATE POLICY "Authenticated users can view keys"
ON public.keys
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert keys"
ON public.keys
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update keys"
ON public.keys
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete keys"
ON public.keys
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- DROP existing permissive policies on bookings table
DROP POLICY IF EXISTS "Allow public insert to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public read access to bookings" ON public.bookings;

-- CREATE secure RLS policies for bookings table
CREATE POLICY "Authenticated users can view bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Make storage bucket private
UPDATE storage.buckets
SET public = false
WHERE id = 'key-images';

-- DROP existing permissive storage policies
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can update images" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete images" ON storage.objects;

-- CREATE secure storage policies
CREATE POLICY "Authenticated users can view key images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'key-images');

CREATE POLICY "Authenticated users can upload key images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'key-images' AND
  (LOWER(SPLIT_PART(name, '.', -1)) = ANY(ARRAY['jpg', 'jpeg', 'png', 'webp']))
);

CREATE POLICY "Only admins can update key images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'key-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete key images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'key-images' AND public.has_role(auth.uid(), 'admin'));