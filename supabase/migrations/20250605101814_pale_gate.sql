/*
  # Create storage bucket for study group posts

  1. New Storage Bucket
    - Creates a new public storage bucket named 'study-group-posts'
    - Enables public access for authenticated users
    - Sets up security policies for image uploads and access

  2. Security
    - Enables RLS
    - Adds policies for:
      - Insert: Only authenticated users can upload
      - Select: Public read access
      - Delete: Only post owners can delete their images
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-group-posts', 'study-group-posts', true);

-- Set up security policies
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'study-group-posts');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'study-group-posts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'study-group-posts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);