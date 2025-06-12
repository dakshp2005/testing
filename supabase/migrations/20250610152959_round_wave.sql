/*
  # Fix infinite recursion in admin_users RLS policies

  1. Problem
    - Current RLS policies on admin_users table cause infinite recursion
    - Policies try to check admin status by querying the same admin_users table
    - This prevents the useAdmin hook from working

  2. Solution
    - Drop the problematic recursive policies
    - Create simpler policies that avoid circular dependencies
    - Allow authenticated users to check their own admin status
    - Restrict management operations to service role only

  3. Security
    - Users can only check if they themselves are admins
    - No user can see other admin users
    - Only service role can manage admin users table
*/

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Admin users are viewable by admins only" ON admin_users;
DROP POLICY IF EXISTS "Only admins can manage admin users" ON admin_users;

-- Create a simple policy that allows users to check their own admin status
-- This avoids recursion by directly comparing the user's email with auth.email()
CREATE POLICY "Users can check their own admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (email = auth.email() AND is_active = true);

-- Only allow service role to manage admin users (insert, update, delete)
-- This prevents regular users from modifying admin status
CREATE POLICY "Only service role can manage admin users"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);