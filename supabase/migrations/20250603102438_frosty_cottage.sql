/*
  # Update Projects Table Schema

  1. Changes
    - Make description field required with minimum length
    - Add created_at timestamp if missing
    - Make all core fields required
  
  2. Safety Measures
    - Check for existing constraints before adding
    - Use IF NOT EXISTS for new constraints
*/

-- Make description field required
ALTER TABLE projects
ALTER COLUMN description SET NOT NULL;

-- Add minimum length constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'description_min_length'
  ) THEN
    ALTER TABLE projects
    ADD CONSTRAINT description_min_length CHECK (length(description) >= 200);
  END IF;
END $$;

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