/*
  # Fix Learning Resources RLS Policies

  1. Security Updates
    - Drop existing problematic policies for learning_resources table
    - Create new policies that work with Supabase auth and admin_users table
    - Ensure proper admin authentication checks

  2. Policy Changes
    - Allow admins to manage learning resources (all operations)
    - Allow public to view published resources
    - Fix admin authentication logic to use auth.email() instead of users table
*/

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Admins can view all resources" ON learning_resources;
DROP POLICY IF EXISTS "Only admins can delete learning resources" ON learning_resources;
DROP POLICY IF EXISTS "Only admins can manage learning resources" ON learning_resources;
DROP POLICY IF EXISTS "Only admins can update learning resources" ON learning_resources;
DROP POLICY IF EXISTS "Published resources are viewable by everyone" ON learning_resources;

-- Create new working policies for learning_resources
CREATE POLICY "Admins can manage all learning resources"
  ON learning_resources
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.email() 
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.email() 
      AND is_active = true
    )
  );

CREATE POLICY "Published resources are viewable by everyone"
  ON learning_resources
  FOR SELECT
  TO public
  USING (is_published = true);

-- Ensure RLS is enabled
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;