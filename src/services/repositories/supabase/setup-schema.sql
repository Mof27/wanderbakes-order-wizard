
-- This SQL file contains the schema setup for the Supabase gallery feature
-- Execute these statements in the Supabase SQL editor to create the necessary tables and functions

-- Create the gallery_photos table to store photo metadata
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  order_id TEXT NOT NULL,
  order_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for gallery_photos
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous read access
CREATE POLICY "Allow anonymous read access" ON public.gallery_photos
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to manage photos
CREATE POLICY "Allow authenticated users to manage photos" ON public.gallery_photos
  USING (auth.role() = 'authenticated');

-- Create the gallery_tags table for tag management
CREATE TABLE IF NOT EXISTS public.gallery_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  value TEXT NOT NULL UNIQUE,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add unique index on tag value
CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_tags_value ON public.gallery_tags(value);

-- Add RLS policies for gallery_tags
ALTER TABLE public.gallery_tags ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous read access to tags
CREATE POLICY "Allow anonymous read access to tags" ON public.gallery_tags
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to manage tags
CREATE POLICY "Allow authenticated users to manage tags" ON public.gallery_tags
  USING (auth.role() = 'authenticated');

-- Create the gallery_photo_tags junction table for many-to-many relationships
CREATE TABLE IF NOT EXISTS public.gallery_photo_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_id UUID NOT NULL REFERENCES public.gallery_photos(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.gallery_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate photo-tag associations
ALTER TABLE public.gallery_photo_tags
  ADD CONSTRAINT unique_photo_tag UNIQUE (photo_id, tag_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_gallery_photo_tags_photo_id ON public.gallery_photo_tags(photo_id);
CREATE INDEX IF NOT EXISTS idx_gallery_photo_tags_tag_id ON public.gallery_photo_tags(tag_id);

-- Add RLS policies for gallery_photo_tags
ALTER TABLE public.gallery_photo_tags ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous read access to photo-tag relationships
CREATE POLICY "Allow anonymous read access to photo-tag relationships" ON public.gallery_photo_tags
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to manage photo-tag relationships
CREATE POLICY "Allow authenticated users to manage photo-tag relationships" ON public.gallery_photo_tags
  USING (auth.role() = 'authenticated');

-- Create function to get tags with their usage counts
CREATE OR REPLACE FUNCTION get_tags_with_counts()
RETURNS TABLE (
  id UUID,
  value TEXT,
  label TEXT,
  count BIGINT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.value,
    t.label,
    COUNT(pt.id)::BIGINT AS count,
    t.created_at
  FROM
    gallery_tags t
  LEFT JOIN
    gallery_photo_tags pt ON t.id = pt.tag_id
  GROUP BY
    t.id, t.value, t.label, t.created_at
  ORDER BY
    count DESC, t.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create storage bucket for cake photos if it doesn't exist
-- Note: This can't be done via SQL; it must be done through the Supabase dashboard or API
-- CREATE STORAGE BUCKET cake-photos;
