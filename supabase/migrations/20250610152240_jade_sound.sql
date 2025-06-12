/*
  # Admin System Implementation

  1. New Tables
    - `admin_users` - Track admin users by email
    - `learning_resources` - Global learning resources managed by admins
    - `resource_categories` - Categories for organizing resources

  2. Security
    - Enable RLS on all new tables
    - Add policies for admin access
    - Add policies for public resource viewing

  3. Changes
    - Add admin role tracking
    - Add comprehensive resource management
*/

-- Create admin_users table to track admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true
);

-- Create resource_categories table
CREATE TABLE IF NOT EXISTS resource_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon_name text DEFAULT 'folder',
  color text DEFAULT '#5164E1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create learning_resources table for admin-managed resources
CREATE TABLE IF NOT EXISTS learning_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text,
  type text NOT NULL CHECK (type IN ('course', 'tutorial', 'article', 'video', 'book', 'tool', 'documentation')),
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category_id uuid REFERENCES resource_categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  url text,
  image_url text,
  duration_minutes integer,
  rating numeric(3,2) DEFAULT 0,
  view_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create resource_reviews table for user feedback
CREATE TABLE IF NOT EXISTS resource_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES learning_resources(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(resource_id, user_id)
);

-- Create user_resource_progress table
CREATE TABLE IF NOT EXISTS user_resource_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id uuid REFERENCES learning_resources(id) ON DELETE CASCADE,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed boolean DEFAULT false,
  last_accessed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resource_progress ENABLE ROW LEVEL SECURITY;

-- Insert admin user
INSERT INTO admin_users (email) VALUES ('colrnx@gmail.com') ON CONFLICT (email) DO NOTHING;

-- Insert default resource categories
INSERT INTO resource_categories (name, description, icon_name, color) VALUES
  ('Programming', 'Programming languages and concepts', 'code', '#3B82F6'),
  ('Web Development', 'Frontend and backend web development', 'globe', '#10B981'),
  ('Data Science', 'Data analysis, machine learning, and AI', 'database', '#8B5CF6'),
  ('Mobile Development', 'iOS and Android app development', 'smartphone', '#F59E0B'),
  ('DevOps', 'Development operations and infrastructure', 'server', '#EF4444'),
  ('Design', 'UI/UX design and graphics', 'palette', '#EC4899'),
  ('Career', 'Professional development and career guidance', 'briefcase', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Create update triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_resource_categories_updated_at'
    AND event_object_table = 'resource_categories'
  ) THEN
    CREATE TRIGGER update_resource_categories_updated_at
      BEFORE UPDATE ON resource_categories
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_learning_resources_updated_at'
    AND event_object_table = 'learning_resources'
  ) THEN
    CREATE TRIGGER update_learning_resources_updated_at
      BEFORE UPDATE ON learning_resources
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_resource_reviews_updated_at'
    AND event_object_table = 'resource_reviews'
  ) THEN
    CREATE TRIGGER update_resource_reviews_updated_at
      BEFORE UPDATE ON resource_reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_user_resource_progress_updated_at'
    AND event_object_table = 'user_resource_progress'
  ) THEN
    CREATE TRIGGER update_user_resource_progress_updated_at
      BEFORE UPDATE ON user_resource_progress
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Admin Users Policies
CREATE POLICY "Admin users are viewable by admins only"
  ON admin_users FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN auth.users u ON u.email = au.email
      WHERE u.id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "Only admins can manage admin users"
  ON admin_users FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN auth.users u ON u.email = au.email
      WHERE u.id = auth.uid() AND au.is_active = true
    )
  );

-- Resource Categories Policies
CREATE POLICY "Resource categories are viewable by everyone"
  ON resource_categories FOR SELECT TO public
  USING (true);

CREATE POLICY "Only admins can manage resource categories"
  ON resource_categories FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN auth.users u ON u.email = au.email
      WHERE u.id = auth.uid() AND au.is_active = true
    )
  );

-- Learning Resources Policies
CREATE POLICY "Published resources are viewable by everyone"
  ON learning_resources FOR SELECT TO public
  USING (is_published = true);

CREATE POLICY "Admins can view all resources"
  ON learning_resources FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN auth.users u ON u.email = au.email
      WHERE u.id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "Only admins can manage learning resources"
  ON learning_resources FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN auth.users u ON u.email = au.email
      WHERE u.id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "Only admins can update learning resources"
  ON learning_resources FOR UPDATE TO public
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN auth.users u ON u.email = au.email
      WHERE u.id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "Only admins can delete learning resources"
  ON learning_resources FOR DELETE TO public
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN auth.users u ON u.email = au.email
      WHERE u.id = auth.uid() AND au.is_active = true
    )
  );

-- Resource Reviews Policies
CREATE POLICY "Users can view all reviews"
  ON resource_reviews FOR SELECT TO public
  USING (true);

CREATE POLICY "Users can create reviews for resources"
  ON resource_reviews FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON resource_reviews FOR UPDATE TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON resource_reviews FOR DELETE TO public
  USING (auth.uid() = user_id);

-- User Resource Progress Policies
CREATE POLICY "Users can view their own progress"
  ON user_resource_progress FOR SELECT TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON user_resource_progress FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_resource_progress FOR UPDATE TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users au
    JOIN auth.users u ON u.email = au.email
    WHERE u.id = user_id AND au.is_active = true
  );
END;
$$;