-- Add delete policy for study groups
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Group leaders can delete their groups" ON study_groups;

-- Recreate the delete policy
CREATE POLICY "Group leaders can delete their groups"
  ON study_groups FOR DELETE
  USING (auth.uid() = leader_id);