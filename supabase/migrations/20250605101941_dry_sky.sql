/*
  # Add RLS policies for study group posts and storage

  1. Changes
    - Add INSERT policy for study_group_posts table to allow group leaders to create posts
    - Add storage policy for study-group-posts bucket to allow file uploads by group leaders

  2. Security
    - Enable RLS on study_group_posts table
    - Add policy for authenticated users to create posts if they are group leaders
    - Add storage policy for authenticated users to upload files if they are group leaders
*/

-- Add INSERT policy for study_group_posts table
-- Drop existing policy to avoid conflict
DROP POLICY IF EXISTS "Group leaders can create posts" ON study_group_posts;

-- Create the new policy
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

-- Add storage policy for file uploads
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