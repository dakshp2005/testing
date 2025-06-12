/*
  # Add storage and policies for study group posts
  
  1. Storage Configuration
    - Creates study-group-posts bucket if it doesn't exist
    - Configures bucket settings for image uploads
    
  2. Security
    - Adds policies for study group posts if they don't exist
    - Adds storage policies for file uploads if they don't exist
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('study-group-posts', 'study-group-posts')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage bucket
UPDATE storage.buckets
SET public = false,
    avif_autodetection = false,
    file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif']
WHERE id = 'study-group-posts';

-- Add INSERT policy for study_group_posts table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'study_group_posts' 
    AND policyname = 'Group leaders can create posts'
  ) THEN
    CREATE POLICY "Group leaders can create posts"
    ON study_group_posts
    FOR INSERT
    TO public
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM study_group_members
        WHERE study_group_members.group_id = study_group_posts.group_id
        AND study_group_members.user_id = auth.uid()
        AND study_group_members.role = 'leader'
      )
    );
  END IF;
END $$;

-- Add storage policy for file uploads if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Group leaders can upload files'
  ) THEN
    CREATE POLICY "Group leaders can upload files"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (
      bucket_id = 'study-group-posts'
      AND (
        SELECT EXISTS (
          SELECT 1 FROM study_group_members
          WHERE study_group_members.group_id = (
            SELECT regexp_matches(storage.objects.name, '^([^/]+)/'))[1]::uuid
          AND study_group_members.user_id = auth.uid()
          AND study_group_members.role = 'leader'
        )
      )
    );
  END IF;
END $$;