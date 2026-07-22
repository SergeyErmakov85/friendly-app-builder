
CREATE TABLE public.game_marks (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service text NOT NULL,
  game_id text NOT NULL,
  date date NOT NULL,
  count int NOT NULL DEFAULT 0 CHECK (count >= 0 AND count <= 20),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, service, game_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_marks TO authenticated;
GRANT ALL ON public.game_marks TO service_role;
ALTER TABLE public.game_marks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own marks select" ON public.game_marks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own marks insert" ON public.game_marks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own marks update" ON public.game_marks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own marks delete" ON public.game_marks FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.game_notes (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service text NOT NULL,
  game_id text NOT NULL,
  note text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, service, game_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_notes TO authenticated;
GRANT ALL ON public.game_notes TO service_role;
ALTER TABLE public.game_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notes select" ON public.game_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own notes insert" ON public.game_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own notes update" ON public.game_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own notes delete" ON public.game_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.toy_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  toy_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  photo_paths text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.toy_entries TO authenticated;
GRANT ALL ON public.toy_entries TO service_role;
ALTER TABLE public.toy_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own toys select" ON public.toy_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own toys insert" ON public.toy_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own toys update" ON public.toy_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own toys delete" ON public.toy_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX toy_entries_user_created_idx ON public.toy_entries (user_id, created_at DESC);
CREATE INDEX game_marks_user_date_idx ON public.game_marks (user_id, date);

CREATE POLICY "toy photos read own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'toy-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "toy photos insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'toy-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "toy photos update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'toy-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "toy photos delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'toy-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
