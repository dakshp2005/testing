/*
  # Add project management features

  1. New Tables
    - project_updates: Track project updates and announcements
    - project_discussions: Enable discussions on project updates
  
  2. Changes
    - Add new columns to project_timelines
    - Add new columns to project_resources
  
  3. Security
    - Enable RLS on new tables
    - Add policies for project participants
*/

-- Add new columns to project_timelines
ALTER TABLE project_timelines
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS attachments text[];

-- Add new columns to project_resources
ALTER TABLE project_resources
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS last_updated_by uuid REFERENCES profiles(id);

-- Create project_updates table
CREATE TABLE IF NOT EXISTS project_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_discussions table
CREATE TABLE IF NOT EXISTS project_discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  update_id uuid REFERENCES project_updates(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_discussions ENABLE ROW LEVEL SECURITY;

-- Create update triggers
CREATE TRIGGER update_project_updates_updated_at
  BEFORE UPDATE ON project_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_discussions_updated_at
  BEFORE UPDATE ON project_discussions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Project Updates Policies
CREATE POLICY "Project updates are viewable by project participants"
  ON project_updates
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_updates.project_id
      AND project_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Project creators can manage updates"
  ON project_updates
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_updates.project_id
      AND project_participants.user_id = auth.uid()
      AND project_participants.role = 'creator'
    )
  );

-- Project Discussions Policies
CREATE POLICY "Project discussions are viewable by project participants"
  ON project_discussions
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_discussions.project_id
      AND project_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Project participants can create discussions"
  ON project_discussions
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_discussions.project_id
      AND project_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own discussions"
  ON project_discussions
  FOR UPDATE
  TO public
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own discussions"
  ON project_discussions
  FOR DELETE
  TO public
  USING (created_by = auth.uid());