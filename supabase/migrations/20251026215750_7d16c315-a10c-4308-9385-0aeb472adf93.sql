-- Remove unused user_roles table and app_role enum
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Remove unused keyboard_shortcut column from keys table
ALTER TABLE public.keys DROP COLUMN IF EXISTS keyboard_shortcut;

-- Add helpful comments to document the tables
COMMENT ON TABLE public.keys IS 'Stores key inventory with descriptions, locations, and status tracking';
COMMENT ON TABLE public.bookings IS 'Records check-in/check-out history for keys with timestamps and user information';

-- Add column comments for better documentation
COMMENT ON COLUMN public.keys.status IS 'Current status: available or checked_out';
COMMENT ON COLUMN public.keys.keywords IS 'Searchable keywords for finding keys';
COMMENT ON COLUMN public.bookings.action IS 'Type of action: check_in or check_out';