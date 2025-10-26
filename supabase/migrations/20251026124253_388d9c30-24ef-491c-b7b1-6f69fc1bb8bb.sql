-- Create storage bucket for key images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('key-images', 'key-images', true);

-- Create storage policies for key images
CREATE POLICY "Public read access to key images"
ON storage.objects FOR SELECT
USING (bucket_id = 'key-images');

CREATE POLICY "Public upload access to key images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'key-images');

CREATE POLICY "Public delete access to key images"
ON storage.objects FOR DELETE
USING (bucket_id = 'key-images');

CREATE POLICY "Public update access to key images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'key-images');

-- Update keys table: remove keyboard_shortcut, add new fields
ALTER TABLE public.keys DROP COLUMN IF EXISTS keyboard_shortcut;
ALTER TABLE public.keys ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.keys ADD COLUMN IF NOT EXISTS additional_notes TEXT;
ALTER TABLE public.keys ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';