-- Add delete policy for study groups
DROP POLICY IF EXISTS "Group leaders can delete their groups" ON study_groups;

CREATE POLICY "Group leaders can delete their groups"
  ON study_groups FOR DELETE
  USING (auth.uid() = leader_id);