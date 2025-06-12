-- Create profiles table to store additional user information
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create courses table
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  duration_hours integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create lessons table
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses on delete cascade,
  title text not null,
  content text,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_courses table to track enrollments and progress
create table public.user_courses (
  user_id uuid references auth.users on delete cascade,
  course_id uuid references public.courses on delete cascade,
  progress float default 0,
  completed boolean default false,
  last_accessed timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, course_id)
);

-- Create user_lessons table to track lesson completion
create table public.user_lessons (
  user_id uuid references auth.users on delete cascade,
  lesson_id uuid references public.lessons on delete cascade,
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, lesson_id)
);

-- Create projects table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_hours integer,
  max_participants integer,
  created_by uuid references auth.users,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create project_participants table
create table public.project_participants (
  project_id uuid references public.projects on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text check (role in ('creator', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (project_id, user_id)
);

-- Create certificates table
create table public.certificates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  course_id uuid references public.courses on delete cascade,
  issued_at timestamp with time zone default timezone('utc'::text, now()) not null,
  certificate_url text
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.user_courses enable row level security;
alter table public.user_lessons enable row level security;
alter table public.projects enable row level security;
alter table public.project_participants enable row level security;
alter table public.certificates enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Courses are viewable by everyone"
  on public.courses for select
  using (true);

create policy "Lessons are viewable by enrolled users"
  on public.lessons for select
  using (
    exists (
      select 1 from public.user_courses
      where user_courses.user_id = auth.uid()
      and user_courses.course_id = lessons.course_id
    )
  );

create policy "Users can view their course progress"
  on public.user_courses for select
  using (auth.uid() = user_id);

create policy "Users can insert their course progress"
  on public.user_courses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their course progress"
  on public.user_courses for update
  using (auth.uid() = user_id);

create policy "Users can view their lesson progress"
  on public.user_lessons for select
  using (auth.uid() = user_id);

create policy "Users can insert their lesson progress"
  on public.user_lessons for insert
  with check (auth.uid() = user_id);

create policy "Users can update their lesson progress"
  on public.user_lessons for update
  using (auth.uid() = user_id);

create policy "Projects are viewable by everyone"
  on public.projects for select
  using (true);

create policy "Users can create projects"
  on public.projects for insert
  with check (auth.uid() = created_by);

create policy "Project creators can update their projects"
  on public.projects for update
  using (auth.uid() = created_by);

create policy "Project participants are viewable by everyone"
  on public.project_participants for select
  using (true);

create policy "Users can join projects"
  on public.project_participants for insert
  with check (auth.uid() = user_id);

create policy "Users can view their certificates"
  on public.certificates for select
  using (auth.uid() = user_id);

-- Create functions and triggers
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_courses_updated_at
  before update on public.courses
  for each row execute procedure public.update_updated_at_column();

create trigger update_lessons_updated_at
  before update on public.lessons
  for each row execute procedure public.update_updated_at_column();

create trigger update_user_courses_updated_at
  before update on public.user_courses
  for each row execute procedure public.update_updated_at_column();

create trigger update_projects_updated_at
  before update on public.projects
  for each row execute procedure public.update_updated_at_column();