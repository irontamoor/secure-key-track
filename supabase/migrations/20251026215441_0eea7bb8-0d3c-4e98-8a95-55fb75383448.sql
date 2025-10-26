-- Drop existing restrictive policies on keys table
DROP POLICY IF EXISTS "Authenticated users can view keys" ON public.keys;
DROP POLICY IF EXISTS "Only admins can delete keys" ON public.keys;
DROP POLICY IF EXISTS "Only admins can insert keys" ON public.keys;
DROP POLICY IF EXISTS "Only admins can update keys" ON public.keys;

-- Drop existing restrictive policies on bookings table
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated users can view bookings" ON public.bookings;

-- Create public access policies for keys table
CREATE POLICY "Public can view keys"
ON public.keys
FOR SELECT
USING (true);

CREATE POLICY "Public can insert keys"
ON public.keys
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update keys"
ON public.keys
FOR UPDATE
USING (true);

CREATE POLICY "Public can delete keys"
ON public.keys
FOR DELETE
USING (true);

-- Create public access policies for bookings table
CREATE POLICY "Public can view bookings"
ON public.bookings
FOR SELECT
USING (true);

CREATE POLICY "Public can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (true);