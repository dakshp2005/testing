/*
  # Project Details Enhancement

  1. New Tables
    - project_updates: For project announcements and updates
    - project_discussions: For discussions on updates
    - project_timelines: For tracking project phases
    - project_resources: For managing project resources

  2. Changes
    - Added status and dates to projects table
    - Added resource management capabilities
    - Added timeline tracking
    - Added update/discussion system

  3. Security
    - Added RLS policies for all new tables
    - Restricted access based on project participation
    - Added proper role-based permissions
*/

-- Add new columns to projects table if they don't exist
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

-- Create update triggers
-- Drop the trigger if it exists to avoid duplication
DROP TRIGGER IF EXISTS update_project_timelines_updated_at ON project_timelines;

-- Re-create the trigger
CREATE TRIGGER update_project_timelines_updated_at
  BEFORE UPDATE ON project_timelines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Safely remove existing trigger to avoid conflict
DROP TRIGGER IF EXISTS update_project_resources_updated_at ON project_resources;

-- Create the trigger again
CREATE TRIGGER update_project_resources_updated_at
  BEFORE UPDATE ON project_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS update_project_discussions_updated_at ON project_discussions;

-- Create the trigger
CREATE TRIGGER update_project_discussions_updated_at
  BEFORE UPDATE ON project_discussions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Project Timelines Policies
-- Drop the existing policy
DROP POLICY IF EXISTS "Project timelines are viewable by project participants" ON project_timelines;

-- Re-create the policy
CREATE POLICY "Project timelines are viewable by project participants"
  ON project_timelines FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_timelines.project_id
        AND project_participants.user_id = auth.uid()
    )
  );

-- Drop the existing policy safely
DROP POLICY IF EXISTS "Project creators can manage timelines" ON project_timelines;

-- Re-create the policy
CREATE POLICY "Project creators can manage timelines"
  ON project_timelines FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_participants.project_id = project_timelines.project_id
        AND project_participants.user_id = auth.uid()
        AND project_participants.role = 'creator'
    )
  );


-- Project Resources Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Project resources are viewable by project participants'
      AND tablename = 'project_resources'
  ) THEN
    CREATE POLICY "Project resources are viewable by project participants"
      ON project_resources FOR SELECT TO public
      USING (
        EXISTS (
          SELECT 1 FROM project_participants
          WHERE project_participants.project_id = project_resources.project_id
            AND project_participants.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Project creators can manage resources'
      AND tablename = 'project_resources'
  ) THEN
    CREATE POLICY "Project creators can manage resources"
      ON project_resources FOR ALL TO public
      USING (
        EXISTS (
          SELECT 1 FROM project_participants
          WHERE project_participants.project_id = project_resources.project_id
            AND project_participants.user_id = auth.uid()
            AND project_participants.role = 'creator'
        )
      );
  END IF;
END
$$;


-- Project Updates Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Project updates are viewable by project participants'
      AND tablename = 'project_updates'
  ) THEN
    CREATE POLICY "Project updates are viewable by project participants"
      ON project_updates FOR SELECT TO public
      USING (
        EXISTS (
          SELECT 1 FROM project_participants
          WHERE project_participants.project_id = project_updates.project_id
            AND project_participants.user_id = auth.uid()
        )
      );
  END IF;
END
$$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Project creators can manage updates'
      AND tablename = 'project_updates'
  ) THEN
    CREATE POLICY "Project creators can manage updates"
      ON project_updates FOR ALL TO public
      USING (
        EXISTS (
          SELECT 1 FROM project_participants
          WHERE project_participants.project_id = project_updates.project_id
            AND project_participants.user_id = auth.uid()
            AND project_participants.role = 'creator'
        )
      );
  END IF;
END
$$;

-- Project Discussions Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Project discussions are viewable by project participants'
      AND tablename = 'project_discussions'
  ) THEN
    CREATE POLICY "Project discussions are viewable by project participants"
      ON project_discussions FOR SELECT TO public
      USING (
        EXISTS (
          SELECT 1 FROM project_participants
          WHERE project_participants.project_id = project_discussions.project_id
            AND project_participants.user_id = auth.uid()
        )
      );
  END IF;
END
$$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Project participants can create discussions'
      AND tablename = 'project_discussions'
  ) THEN
    CREATE POLICY "Project participants can create discussions"
      ON project_discussions FOR INSERT TO public
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM project_participants
          WHERE project_participants.project_id = project_discussions.project_id
            AND project_participants.user_id = auth.uid()
        )
      );
  END IF;
END
$$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can update their own discussions'
      AND tablename = 'project_discussions'
  ) THEN
    CREATE POLICY "Users can update their own discussions"
      ON project_discussions FOR UPDATE TO public
      USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid());
  END IF;
END
$$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can delete their own discussions'
      AND tablename = 'project_discussions'
  ) THEN
    CREATE POLICY "Users can delete their own discussions"
      ON project_discussions FOR DELETE TO public
      USING (created_by = auth.uid());
  END IF;
END
$$;
