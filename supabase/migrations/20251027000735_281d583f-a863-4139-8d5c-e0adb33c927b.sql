-- Drop the old action constraint that only allows check_in and check_out
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_action_check;

-- Create new action constraint that allows all 5 action types
ALTER TABLE public.bookings ADD CONSTRAINT bookings_action_check 
  CHECK (action IN ('check_in', 'check_out', 'key_created', 'key_updated', 'key_deleted'));