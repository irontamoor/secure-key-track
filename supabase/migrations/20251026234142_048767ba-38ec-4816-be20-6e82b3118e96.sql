-- Add columns to support comprehensive activity logging
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS changed_fields JSONB,
  ADD COLUMN IF NOT EXISTS old_values JSONB,
  ADD COLUMN IF NOT EXISTS new_values JSONB;

-- Update table comment to reflect expanded purpose
COMMENT ON TABLE public.bookings IS 'Activity log for all key-related actions: check-ins, check-outs, creation, editing, and deletion';

-- Update action column comment to include all action types
COMMENT ON COLUMN public.bookings.action IS 'Type of action: check_in, check_out, key_created, key_updated, key_deleted';