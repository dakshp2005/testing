/*
  # Add foreign key constraint to project_participants table

  1. Changes
    - Add foreign key constraint from project_participants.user_id to profiles.id
    - This enables proper joins between project_participants and profiles tables
    - Ensures referential integrity for user data
    - Enables cascade deletion when a profile is deleted

  2. Security
    - No changes to RLS policies
    - Maintains existing table permissions
*/

-- Add foreign key constraint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'project_participants_user_id_fkey_profiles'
  ) THEN
    ALTER TABLE project_participants
    ADD CONSTRAINT project_participants_user_id_fkey_profiles
    FOREIGN KEY (user_id) REFERENCES profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;