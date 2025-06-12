/*
  # Add storage support for study group posts
  
  1. Changes
    - Remove image_url column from study_group_posts table
    - Add image_path column to store the file path in storage bucket
    
  2. Storage
    - Images will be stored in the 'study-group-posts' bucket
*/

-- Remove image_url column and add image_path
ALTER TABLE study_group_posts 
  DROP COLUMN IF EXISTS image_url,
  ADD COLUMN IF NOT EXISTS image_path text;