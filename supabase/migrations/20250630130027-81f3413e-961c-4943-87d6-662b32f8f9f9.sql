
-- Create profiles table to store user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common subjects
INSERT INTO public.subjects (name, description) VALUES
('Mathematics', 'Algebra, Geometry, Calculus, Statistics'),
('Science', 'Physics, Chemistry, Biology'),
('English', 'Literature, Grammar, Writing, Reading Comprehension'),
('History', 'World History, Local History, Social Studies'),
('Computer Science', 'Programming, Data Structures, Algorithms'),
('Art', 'Drawing, Painting, Design, Art History'),
('Music', 'Theory, Performance, Composition'),
('Physical Education', 'Sports, Fitness, Health Education'),
('Foreign Languages', 'Spanish, French, German, Mandarin'),
('Economics', 'Microeconomics, Macroeconomics, Business Studies');

-- Create academic levels table
CREATE TABLE public.academic_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade_level INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert academic levels including grades 5-8
INSERT INTO public.academic_levels (name, grade_level, description) VALUES
('Grade 5', 5, 'Elementary School - Grade 5'),
('Grade 6', 6, 'Middle School - Grade 6'),
('Grade 7', 7, 'Middle School - Grade 7'),
('Grade 8', 8, 'Middle School - Grade 8'),
('Grade 9', 9, 'High School - Grade 9'),
('Grade 10', 10, 'High School - Grade 10'),
('Grade 11', 11, 'High School - Grade 11'),
('Grade 12', 12, 'High School - Grade 12'),
('College Freshman', 13, 'College/University - Year 1'),
('College Sophomore', 14, 'College/University - Year 2'),
('College Junior', 15, 'College/University - Year 3'),
('College Senior', 16, 'College/University - Year 4'),
('Graduate', 17, 'Graduate/Masters Level'),
('Professional', 18, 'Professional Certification Exams');

-- Create user study plans table
CREATE TABLE public.user_study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  academic_level_id UUID REFERENCES public.academic_levels(id) ON DELETE CASCADE NOT NULL,
  exam_date DATE NOT NULL,
  class_name TEXT,
  study_hours_per_day INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timetables table
CREATE TABLE public.timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  study_plan_id UUID REFERENCES public.user_study_plans(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  topic TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for subjects (public read)
CREATE POLICY "Anyone can view subjects" ON public.subjects
  FOR SELECT USING (true);

-- Create RLS policies for academic levels (public read)
CREATE POLICY "Anyone can view academic levels" ON public.academic_levels
  FOR SELECT USING (true);

-- Create RLS policies for user study plans
CREATE POLICY "Users can view their own study plans" ON public.user_study_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study plans" ON public.user_study_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans" ON public.user_study_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study plans" ON public.user_study_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for timetables
CREATE POLICY "Users can view their own timetables" ON public.timetables
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own timetables" ON public.timetables
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timetables" ON public.timetables
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timetables" ON public.timetables
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
