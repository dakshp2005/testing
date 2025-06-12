/*
  # Add tags column to projects table

  1. Changes
    - Add `tags` column to `projects` table as text array
      - Allows storing multiple tags per project
      - Defaults to empty array
      - Can be null

  2. Security
    - Inherits existing RLS policies from projects table
*/

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];

-- Update RLS policies to include the new column
-- Not needed as the existing policies already cover all columns