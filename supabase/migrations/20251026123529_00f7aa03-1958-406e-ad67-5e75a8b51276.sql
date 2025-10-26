-- Create keys table
CREATE TABLE public.keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_number TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out')),
  keyboard_shortcut TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table for tracking check-ins and check-outs
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID NOT NULL REFERENCES public.keys(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('check_out', 'check_in')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create index for faster searches
CREATE INDEX idx_keys_number ON public.keys(key_number);
CREATE INDEX idx_keys_keywords ON public.keys USING GIN(keywords);
CREATE INDEX idx_bookings_user_name ON public.bookings(user_name);
CREATE INDEX idx_bookings_key_id ON public.bookings(key_id);
CREATE INDEX idx_bookings_timestamp ON public.bookings(timestamp DESC);

-- Enable RLS
ALTER TABLE public.keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies (public access since no auth required)
CREATE POLICY "Allow public read access to keys" 
  ON public.keys FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to keys" 
  ON public.keys FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update to keys" 
  ON public.keys FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete to keys" 
  ON public.keys FOR DELETE 
  USING (true);

CREATE POLICY "Allow public read access to bookings" 
  ON public.bookings FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to bookings" 
  ON public.bookings FOR INSERT 
  WITH CHECK (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_keys_updated_at
  BEFORE UPDATE ON public.keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically update key status when booking happens
CREATE OR REPLACE FUNCTION public.update_key_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action = 'check_out' THEN
    UPDATE public.keys SET status = 'checked_out' WHERE id = NEW.key_id;
  ELSIF NEW.action = 'check_in' THEN
    UPDATE public.keys SET status = 'available' WHERE id = NEW.key_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update key status on booking
CREATE TRIGGER update_key_status_on_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_key_status();