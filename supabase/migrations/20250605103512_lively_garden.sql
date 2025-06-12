/*
# Add Project Details Schema

1. New Tables
  - `project_timelines`
    - Tracks project progress across different phases
    - Stores phase-specific content and updates
  - `project_resources`
    - Stores project documentation and resources
    - Links to external resources and forums

2. Changes
  - Add new columns to projects table for enhanced tracking
  - Update existing RLS policies

3. Security
  - Enable RLS on new tables
  - Add appropriate policies for creators and members
*/

-- Add new columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS status text DEFAULT 'planning' CHECK (status IN ('planning', 'development', 'testing', 'launched')),
ADD COLUMN IF NOT EXISTS start_date timestamptz,
ADD COLUMN IF NOT EXISTS target_completion_date timestamptz;

-- Create project_timelines table
CREATE TABLE IF NOT EXISTS project_timelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  phase text NOT NULL CHECK (phase IN ('planning', 'development', 'testing', 'launch')),
  content text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_resources table
CREATE TABLE IF NOT EXISTS project_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('document', 'link', 'forum')),
  url text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE project_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;

-- Create update triggers
-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS update_project_timelines_updated_at ON project_timelines;

-- Then create the trigger
CREATE TRIGGER update_project_timelines_updated_at
  BEFORE UPDATE ON project_timelines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_project_resources_updated_at ON project_resources;

-- Create the trigger
CREATE TRIGGER update_project_resources_updated_at
  BEFORE UPDATE ON project_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Project Timelines Policies
CREATE POLICY "Project timelines are viewable by project participants"
  ON project_timelines
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_timelines.project_id
      AND project_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Project creators can manage timelines"
  ON project_timelines
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_timelines.project_id
      AND project_participants.user_id = auth.uid()
      AND project_participants.role = 'creator'
    )
  );

-- Project Resources Policies
CREATE POLICY "Project resources are viewable by project participants"
  ON project_resources
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_resources.project_id
      AND project_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Project creators can manage resources"
  ON project_resources
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_resources.project_id
      AND project_participants.user_id = auth.uid()
      AND project_participants.role = 'creator'
    )
  );