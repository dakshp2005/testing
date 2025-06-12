-- Create study groups table
CREATE TABLE public.study_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  leader_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  schedule text NOT NULL,
  max_members integer NOT NULL,
  level text CHECK (level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}'::text[],
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT description_min_length CHECK (length(description) >= 200)
);

-- Create study group members table
CREATE TABLE public.study_group_members (
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text CHECK (role IN ('leader', 'member')) NOT NULL,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (group_id, user_id)
);

-- Create study group discussions table
CREATE TABLE public.study_group_discussions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_discussions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Study groups are viewable by everyone"
  ON study_groups FOR SELECT
  USING (true);

CREATE POLICY "Users can create study groups"
  ON study_groups FOR INSERT
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Group leaders can update their groups"
  ON study_groups FOR UPDATE
  USING (auth.uid() = leader_id);

CREATE POLICY "Members are viewable by everyone"
  ON study_group_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join groups"
  ON study_group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON study_group_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Group discussions are viewable by members"
  ON study_group_discussions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE group_id = study_group_discussions.group_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can post discussions"
  ON study_group_discussions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE group_id = study_group_discussions.group_id
      AND user_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_study_groups_updated_at
  BEFORE UPDATE ON study_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_group_discussions_updated_at
  BEFORE UPDATE ON study_group_discussions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();