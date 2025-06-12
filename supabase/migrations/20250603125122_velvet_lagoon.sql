/*
  # Add Achievements System

  1. New Tables
    - achievements: Stores available achievements
      - id (uuid, primary key)
      - title (text)
      - description (text) 
      - icon_name (text)
      - points (integer)
      - criteria (text)
      - created_at (timestamptz)
    
    - user_achievements: Tracks user progress
      - user_id (uuid)
      - achievement_id (uuid)
      - earned_at (timestamptz)
      - progress (integer)

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing achievements and progress
*/

-- Create achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  criteria text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  progress integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, achievement_id)
);

-- Enable RLS
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'Achievements are viewable by everyone'
  ) THEN
    ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Achievements are viewable by everyone"
      ON achievements
      FOR SELECT
      TO public
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Users can view their own achievement progress'
  ) THEN
    ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own achievement progress"
      ON user_achievements
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Insert initial achievements if they don't exist
INSERT INTO achievements (title, description, icon_name, points, criteria)
SELECT * FROM (VALUES
  ('First Steps', 'Complete your first lesson', 'graduation-cap', 10, 'Complete 1 lesson'),
  ('Quick Learner', 'Complete 5 lessons in a day', 'zap', 50, 'Complete 5 lessons in 24 hours'),
  ('Team Player', 'Join your first project', 'users', 20, 'Join 1 project'),
  ('Community Builder', 'Create a study group', 'users-plus', 30, 'Create 1 study group'),
  ('Course Master', 'Complete a full course', 'award', 100, 'Complete 1 course'),
  ('Coding Streak', 'Learn for 7 consecutive days', 'flame', 70, 'Login and learn for 7 days'),
  ('Helper', 'Help 5 other students', 'helping-hand', 40, 'Help 5 students'),
  ('Project Creator', 'Create your first project', 'folder-plus', 25, 'Create 1 project'),
  ('Rising Star', 'Earn 500 points', 'star', 150, 'Accumulate 500 points'),
  ('Expert Collaborator', 'Complete 5 group projects', 'users-round', 200, 'Complete 5 projects')
) AS new_achievements
WHERE NOT EXISTS (
  SELECT 1 FROM achievements WHERE title = new_achievements.column1
);