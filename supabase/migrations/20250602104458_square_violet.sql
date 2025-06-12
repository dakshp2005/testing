/*
  # Add foreign key relationship between projects and profiles

  1. Changes
    - Add foreign key constraint from projects.created_by to profiles.id
    - This enables joining projects with profiles to get creator information

  2. Security
    - No changes to RLS policies
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'projects_created_by_fkey_profiles'
  ) THEN
    ALTER TABLE projects
    ADD CONSTRAINT projects_created_by_fkey_profiles
    FOREIGN KEY (created_by) REFERENCES profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;