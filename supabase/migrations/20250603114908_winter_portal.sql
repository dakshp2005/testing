/*
  # Update Projects Table Schema

  1. Changes
    - Drop existing constraint if it exists
    - Make description field required with minimum length
    - Add created_at timestamp if missing
    - Make all core fields required
  
  2. Safety Measures
    - Check for existing constraint before adding
    - Use DO block for conditional operations
*/

-- Drop existing constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'description_min_length'
    AND table_name = 'projects'
  ) THEN
    ALTER TABLE projects DROP CONSTRAINT description_min_length;
  END IF;
END $$;

-- Make description field required and add minimum length constraint
ALTER TABLE projects
ALTER COLUMN description SET NOT NULL;

ALTER TABLE projects
ADD CONSTRAINT description_min_length CHECK (length(description) >= 200);

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'projects' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE projects 
    ADD COLUMN created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
  END IF;
END $$;

-- Make all fields required
ALTER TABLE projects
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN difficulty SET NOT NULL,
ALTER COLUMN estimated_hours SET NOT NULL,
ALTER COLUMN max_participants SET NOT NULL,
ALTER COLUMN category SET NOT NULL,
ALTER COLUMN created_by SET NOT NULL;