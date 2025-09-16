-- Create storage bucket for gallery photos
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

-- Create gallery_photos table
CREATE TABLE public.gallery_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  order_id TEXT NOT NULL,
  order_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_count INTEGER NOT NULL DEFAULT 0
);

-- Create custom_tags table for user-created tags
CREATE TABLE public.custom_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create photo_tags junction table
CREATE TABLE public.photo_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL REFERENCES public.gallery_photos(id) ON DELETE CASCADE,
  tag_type TEXT NOT NULL CHECK (tag_type IN ('order_tag', 'custom_tag')),
  tag_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(photo_id, tag_type, tag_value)
);

-- Enable RLS on all tables
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for gallery_photos
CREATE POLICY "Authenticated users can view all gallery photos"
ON public.gallery_photos FOR SELECT
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can insert gallery photos"
ON public.gallery_photos FOR INSERT
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can update gallery photos"
ON public.gallery_photos FOR UPDATE
USING (auth.role() = 'authenticated'::text);

-- RLS policies for custom_tags
CREATE POLICY "Authenticated users can view all custom tags"
ON public.custom_tags FOR SELECT
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can create custom tags"
ON public.custom_tags FOR INSERT
WITH CHECK (auth.role() = 'authenticated'::text);

-- RLS policies for photo_tags
CREATE POLICY "Authenticated users can view all photo tags"
ON public.photo_tags FOR SELECT
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can create photo tags"
ON public.photo_tags FOR INSERT
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can delete photo tags"
ON public.photo_tags FOR DELETE
USING (auth.role() = 'authenticated'::text);

-- Storage policies for gallery bucket
CREATE POLICY "Gallery images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can upload to gallery"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can update gallery files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'gallery' AND auth.role() = 'authenticated'::text);

-- Create indexes for better performance
CREATE INDEX idx_gallery_photos_order_id ON public.gallery_photos(order_id);
CREATE INDEX idx_gallery_photos_created_at ON public.gallery_photos(created_at DESC);
CREATE INDEX idx_photo_tags_photo_id ON public.photo_tags(photo_id);
CREATE INDEX idx_photo_tags_tag_value ON public.photo_tags(tag_value);

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_photo_view_count(photo_id UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.gallery_photos 
  SET view_count = view_count + 1 
  WHERE id = photo_id;
$$;