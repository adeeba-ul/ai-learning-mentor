
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  interests TEXT[] DEFAULT '{}',
  career_goals TEXT,
  skills TEXT[] DEFAULT '{}',
  completed_courses TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles: select own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles: insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles: update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Certificates
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | analyzed | failed
  extracted_skills TEXT[] DEFAULT '{}',
  technologies TEXT[] DEFAULT '{}',
  proficiency TEXT,
  summary TEXT,
  ai_raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Certs: select own" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Certs: insert own" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Certs: update own" ON public.certificates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Certs: delete own" ON public.certificates FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER certs_updated_at BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Recommendations cache
CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recs: select own" ON public.recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Recs: insert own" ON public.recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Recs: delete own" ON public.recommendations FOR DELETE USING (auth.uid() = user_id);

-- Saved courses
CREATE TABLE public.saved_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  provider TEXT DEFAULT 'Coursera',
  url TEXT,
  category TEXT,
  level TEXT,
  rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Saved: select own" ON public.saved_courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Saved: insert own" ON public.saved_courses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Saved: delete own" ON public.saved_courses FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Cert files: read own" ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Cert files: upload own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Cert files: delete own" ON storage.objects FOR DELETE
  USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
