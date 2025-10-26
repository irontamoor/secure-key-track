-- Fix function search path by recreating with CASCADE
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_key_status() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_key_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.action = 'check_out' THEN
    UPDATE public.keys SET status = 'checked_out' WHERE id = NEW.key_id;
  ELSIF NEW.action = 'check_in' THEN
    UPDATE public.keys SET status = 'available' WHERE id = NEW.key_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the triggers
CREATE TRIGGER update_keys_updated_at
  BEFORE UPDATE ON public.keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_key_status_on_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_key_status();