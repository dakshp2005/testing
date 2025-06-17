/*
  # Fix description_min_length constraint conflict

  1. Changes
    - Drop existing description_min_length constraint if it exists
    - Add new description_min_length constraint with proper length validation
    - Ensure constraint allows for meaningful project descriptions

  2. Security
    - Maintains data integrity with proper length validation
    - Ensures projects have adequate descriptions for quality control
*/

-- Drop the existing constraint if it exists
ALTER TABLE projects DROP CONSTRAINT IF EXISTS description_min_length;

-- Add the new constraint with proper validation
-- Using 200 characters minimum as indicated in your application code
ALTER TABLE projects
ADD CONSTRAINT description_min_length CHECK (char_length(description) >= 200);

-- Also ensure the constraint name is consistent across the schema
-- Drop any potential duplicate constraints with similar names
ALTER TABLE projects DROP CONSTRAINT IF EXISTS description_min_length_v2;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_description_check;

-- Verify the constraint is properly applied
-- This will show all constraints on the projects table
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'projects'::regclass;