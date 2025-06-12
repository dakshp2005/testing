/*
  # Project Management Enhancement

  1. New Tables
    - `project_timelines` - Track project phases and milestones
    - `project_resources` - Store project documents, links, and resources
    - `project_updates` - Project status updates and announcements
    - `project_discussions` - Comments and discussions on updates

  2. Table Updates
    - Add status, start_date, target_completion_date to projects table

  3. Security
    - Enable RLS on all new tables
    - Add policies for project participants access control
    - Project creators have full management rights
    - Project participants can view and create discussions
*/

-- Add new columns to projects table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'status'
  ) THEN
    ALTER TABLE projects ADD COLUMN status text DEFAULT 'planning' CHECK (status IN ('planning', 'development', 'testing', 'launched'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE projects ADD COLUMN start_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'target_completion_date'
  ) THEN
    ALTER TABLE projects ADD COLUMN target_completion_date timestamptz;
  END IF;
END $$;

-- Create project_timelines table
CREATE TABLE IF NOT EXISTS project_timelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  phase text NOT NULL CHECK (phase IN ('planning', 'development', 'testing', 'launch')),
  content text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  start_date timestamptz,
  end_date timestamptz,
  description text,
  attachments text[],
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
  tags text[],
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  last_updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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
ALTER TABLE project_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_discussions ENABLE ROW LEVEL SECURITY;

-- Create update triggers with existence checks
DO $$
BEGIN
  -- Check and create trigger for project_timelines
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_project_timelines_updated_at'
    AND event_object_table = 'project_timelines'
  ) THEN
    CREATE TRIGGER update_project_timelines_updated_at
      BEFORE UPDATE ON project_timelines
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Check and create trigger for project_resources
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_project_resources_updated_at'
    AND event_object_table = 'project_resources'
  ) THEN
    CREATE TRIGGER update_project_resources_updated_at
      BEFORE UPDATE ON project_resources
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Check and create trigger for project_updates
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_project_updates_updated_at'
    AND event_object_table = 'project_updates'
  ) THEN
    CREATE TRIGGER update_project_updates_updated_at
      BEFORE UPDATE ON project_updates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Check and create trigger for project_discussions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_project_discussions_updated_at'
    AND event_object_table = 'project_discussions'
  ) THEN
    CREATE TRIGGER update_project_discussions_updated_at
      BEFORE UPDATE ON project_discussions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Project Timelines Policies
  DROP POLICY IF EXISTS "Project timelines are viewable by project participants" ON project_timelines;
  DROP POLICY IF EXISTS "Project creators can manage timelines" ON project_timelines;

  CREATE POLICY "Project timelines are viewable by project participants"
    ON project_timelines FOR SELECT TO public
    USING (EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_timelines.project_id
      AND project_participants.user_id = auth.uid()
    ));

  CREATE POLICY "Project creators can manage timelines"
    ON project_timelines FOR ALL TO public
    USING (EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_timelines.project_id
      AND project_participants.user_id = auth.uid()
      AND project_participants.role = 'creator'
    ));

  -- Project Resources Policies
  DROP POLICY IF EXISTS "Project resources are viewable by project participants" ON project_resources;
  DROP POLICY IF EXISTS "Project creators can manage resources" ON project_resources;

  CREATE POLICY "Project resources are viewable by project participants"
    ON project_resources FOR SELECT TO public
    USING (EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_resources.project_id
      AND project_participants.user_id = auth.uid()
    ));

  CREATE POLICY "Project creators can manage resources"
    ON project_resources FOR ALL TO public
    USING (EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_resources.project_id
      AND project_participants.user_id = auth.uid()
      AND project_participants.role = 'creator'
    ));

  -- Project Updates Policies
  DROP POLICY IF EXISTS "Project updates are viewable by project participants" ON project_updates;
  DROP POLICY IF EXISTS "Project creators can manage updates" ON project_updates;

  CREATE POLICY "Project updates are viewable by project participants"
    ON project_updates FOR SELECT TO public
    USING (EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_updates.project_id
      AND project_participants.user_id = auth.uid()
    ));

  CREATE POLICY "Project creators can manage updates"
    ON project_updates FOR ALL TO public
    USING (EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_updates.project_id
      AND project_participants.user_id = auth.uid()
      AND project_participants.role = 'creator'
    ));

  -- Project Discussions Policies
  DROP POLICY IF EXISTS "Project discussions are viewable by project participants" ON project_discussions;
  DROP POLICY IF EXISTS "Project participants can create discussions" ON project_discussions;
  DROP POLICY IF EXISTS "Users can update their own discussions" ON project_discussions;
  DROP POLICY IF EXISTS "Users can delete their own discussions" ON project_discussions;

  CREATE POLICY "Project discussions are viewable by project participants"
    ON project_discussions FOR SELECT TO public
    USING (EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_discussions.project_id
      AND project_participants.user_id = auth.uid()
    ));

  CREATE POLICY "Project participants can create discussions"
    ON project_discussions FOR INSERT TO public
    WITH CHECK (EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_discussions.project_id
      AND project_participants.user_id = auth.uid()
    ));

  CREATE POLICY "Users can update their own discussions"
    ON project_discussions FOR UPDATE TO public
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

  CREATE POLICY "Users can delete their own discussions"
    ON project_discussions FOR DELETE TO public
    USING (created_by = auth.uid());
END $$;