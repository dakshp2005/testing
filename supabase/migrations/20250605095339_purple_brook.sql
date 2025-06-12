/*
  # Add Community Posts

  1. New Tables
    - `study_group_posts` - Stores posts made in study groups
      - `id` (uuid, primary key)
      - `group_id` (uuid, references study_groups)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `image_url` (text, optional)
      - `link_url` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on study_group_posts
    - Add policies for viewing and creating posts
*/

-- Create study group posts table
CREATE TABLE IF NOT EXISTS study_group_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  link_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT content_not_empty CHECK (length(trim(content)) > 0)
);

-- Enable RLS
ALTER TABLE study_group_posts ENABLE ROW LEVEL SECURITY;

-- Create posts update trigger
CREATE TRIGGER update_study_group_posts_updated_at
  BEFORE UPDATE ON study_group_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies
CREATE POLICY "Group members can view posts"
  ON study_group_posts
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_group_posts.group_id
      AND study_group_members.user_id = auth.uid()
    )
  );

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

CREATE POLICY "Group leaders can update their posts"
  ON study_group_posts
  FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_group_posts.group_id
      AND study_group_members.user_id = auth.uid()
      AND study_group_members.role = 'leader'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_group_posts.group_id
      AND study_group_members.user_id = auth.uid()
      AND study_group_members.role = 'leader'
    )
  );

CREATE POLICY "Group leaders can delete their posts"
  ON study_group_posts
  FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_group_posts.group_id
      AND study_group_members.user_id = auth.uid()
      AND study_group_members.role = 'leader'
    )
  );