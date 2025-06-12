/*
  # Add bio column to profiles table

  1. Changes
    - Add `bio` column to `profiles` table
      - Type: TEXT
      - Nullable: true
      - Default: NULL

  2. Reason
    - Support storing user biographies in profile information
    - Required for profile page functionality
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;
END $$;