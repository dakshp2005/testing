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

-- Update existing null descriptions with placeholder text
UPDATE projects 
SET description = 'This project description needs to be updated to meet the minimum length requirement. Please provide detailed information about the project goals, requirements, and expected outcomes to help potential participants understand the scope and requirements better.'
WHERE description IS NULL OR length(description) < 200;

-- Make fields required and add constraints
ALTER TABLE projects
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN difficulty SET NOT NULL,
ALTER COLUMN estimated_hours SET NOT NULL,
ALTER COLUMN max_participants SET NOT NULL,
ALTER COLUMN created_by SET NOT NULL,
ALTER COLUMN description SET NOT NULL;

-- Add description length constraint
ALTER TABLE projects
DROP CONSTRAINT IF EXISTS description_min_length;

ALTER TABLE projects
ADD CONSTRAINT description_min_length CHECK (length(description) >= 200);
