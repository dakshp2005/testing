/*
  # Fix storage policies for study group posts

  1. Changes
    - Update storage bucket configuration
    - Add proper storage policies for public access and uploads
    - Fix image path handling in posts table
  
  2. Security
    - Enable public access to images
    - Restrict uploads to group leaders
    - Add proper file size and type restrictions
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('study-group-posts', 'study-group-posts')
ON CONFLICT (id) DO NOTHING;

-- Enable public access and set restrictions
UPDATE storage.buckets
SET public = true,
    avif_autodetection = false,
    file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif']
WHERE id = 'study-group-posts';

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
  DROP POLICY IF EXISTS "Group leaders can upload files" ON storage.objects;
  DROP POLICY IF EXISTS "Group leaders can delete files" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add storage policies
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'study-group-posts');

CREATE POLICY "Group leaders can upload files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'study-group-posts'
  AND EXISTS (
    SELECT 1 FROM study_group_members
    WHERE study_group_members.group_id = (regexp_match(name, '^([^/]+)/'))[1]::uuid
    AND study_group_members.user_id = auth.uid()
    AND study_group_members.role = 'leader'
  )
);

CREATE POLICY "Group leaders can delete files"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'study-group-posts'
  AND EXISTS (
    SELECT 1 FROM study_group_members
    WHERE study_group_members.group_id = (regexp_match(name, '^([^/]+)/'))[1]::uuid
    AND study_group_members.user_id = auth.uid()
    AND study_group_members.role = 'leader'
  )
);