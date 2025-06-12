/*
  # Add category column to projects table

  1. Changes
    - Add 'category' column to projects table
      - Type: text
      - Nullable: true
      - No default value

  2. Notes
    - Using DO block to safely add column if it doesn't exist
    - Category will be optional for existing projects
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'projects' 
    AND column_name = 'category'
  ) THEN 
    ALTER TABLE projects 
    ADD COLUMN category text;
  END IF;
END $$;