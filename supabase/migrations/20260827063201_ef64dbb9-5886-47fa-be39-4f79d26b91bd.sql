-- 1. Таблица связей аккаунтов
CREATE TABLE public.account_links (
  member_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.account_links TO authenticated;
GRANT ALL ON public.account_links TO service_role;

ALTER TABLE public.account_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own link select" ON public.account_links
  FOR SELECT TO authenticated USING (auth.uid() = member_id);

-- 2. Вспомогательные функции
CREATE OR REPLACE FUNCTION public.data_owner_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT l.owner_id FROM public.account_links l WHERE l.member_id = auth.uid()), auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.data_member_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid()
  UNION
  SELECT l.member_id FROM public.account_links l WHERE l.owner_id = public.data_owner_id();
$$;

GRANT EXECUTE ON FUNCTION public.data_owner_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.data_member_ids() TO authenticated;

-- 3. Связываем учётные записи
INSERT INTO public.account_links (member_id, owner_id) VALUES
  ('0bab9c36-55ac-4572-a2d4-98b3a73550ca', '0bab9c36-55ac-4572-a2d4-98b3a73550ca'),
  ('cf7926d7-e70c-45ad-b081-532bac4c7de0', '0bab9c36-55ac-4572-a2d4-98b3a73550ca');

-- 4. Обновляем политики доступа
DROP POLICY IF EXISTS "own marks select" ON public.game_marks;
DROP POLICY IF EXISTS "own marks insert" ON public.game_marks;
DROP POLICY IF EXISTS "own marks update" ON public.game_marks;
DROP POLICY IF EXISTS "own marks delete" ON public.game_marks;
CREATE POLICY "shared marks select" ON public.game_marks FOR SELECT TO authenticated USING (user_id = public.data_owner_id());
CREATE POLICY "shared marks insert" ON public.game_marks FOR INSERT TO authenticated WITH CHECK (user_id = public.data_owner_id());
CREATE POLICY "shared marks update" ON public.game_marks FOR UPDATE TO authenticated USING (user_id = public.data_owner_id()) WITH CHECK (user_id = public.data_owner_id());
CREATE POLICY "shared marks delete" ON public.game_marks FOR DELETE TO authenticated USING (user_id = public.data_owner_id());

DROP POLICY IF EXISTS "own notes select" ON public.game_notes;
DROP POLICY IF EXISTS "own notes insert" ON public.game_notes;
DROP POLICY IF EXISTS "own notes update" ON public.game_notes;
DROP POLICY IF EXISTS "own notes delete" ON public.game_notes;
CREATE POLICY "shared notes select" ON public.game_notes FOR SELECT TO authenticated USING (user_id = public.data_owner_id());
CREATE POLICY "shared notes insert" ON public.game_notes FOR INSERT TO authenticated WITH CHECK (user_id = public.data_owner_id());
CREATE POLICY "shared notes update" ON public.game_notes FOR UPDATE TO authenticated USING (user_id = public.data_owner_id()) WITH CHECK (user_id = public.data_owner_id());
CREATE POLICY "shared notes delete" ON public.game_notes FOR DELETE TO authenticated USING (user_id = public.data_owner_id());

DROP POLICY IF EXISTS "own toys select" ON public.toy_entries;
DROP POLICY IF EXISTS "own toys insert" ON public.toy_entries;
DROP POLICY IF EXISTS "own toys update" ON public.toy_entries;
DROP POLICY IF EXISTS "own toys delete" ON public.toy_entries;
CREATE POLICY "shared toys select" ON public.toy_entries FOR SELECT TO authenticated USING (user_id = public.data_owner_id());
CREATE POLICY "shared toys insert" ON public.toy_entries FOR INSERT TO authenticated WITH CHECK (user_id = public.data_owner_id());
CREATE POLICY "shared toys update" ON public.toy_entries FOR UPDATE TO authenticated USING (user_id = public.data_owner_id()) WITH CHECK (user_id = public.data_owner_id());
CREATE POLICY "shared toys delete" ON public.toy_entries FOR DELETE TO authenticated USING (user_id = public.data_owner_id());

-- 5. Политики на фото игрушек: доступ к папкам всех связанных аккаунтов
DROP POLICY IF EXISTS "toy photos read own" ON storage.objects;
DROP POLICY IF EXISTS "toy photos insert own" ON storage.objects;
DROP POLICY IF EXISTS "toy photos update own" ON storage.objects;
DROP POLICY IF EXISTS "toy photos delete own" ON storage.objects;
CREATE POLICY "toy photos read shared" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'toy-photos' AND (storage.foldername(name))[1] IN (SELECT public.data_member_ids()::text));
CREATE POLICY "toy photos insert shared" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'toy-photos' AND (storage.foldername(name))[1] = (auth.uid())::text);
CREATE POLICY "toy photos update shared" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'toy-photos' AND (storage.foldername(name))[1] IN (SELECT public.data_member_ids()::text));
CREATE POLICY "toy photos delete shared" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'toy-photos' AND (storage.foldername(name))[1] IN (SELECT public.data_member_ids()::text));

-- 6. Перенос уже накопленных данных на основную учётную запись
INSERT INTO public.game_marks (user_id, service, game_id, date, count, updated_at)
SELECT '0bab9c36-55ac-4572-a2d4-98b3a73550ca', service, game_id, date, count, updated_at
FROM public.game_marks WHERE user_id = 'cf7926d7-e70c-45ad-b081-532bac4c7de0'
ON CONFLICT (user_id, service, game_id, date) DO UPDATE
  SET count = GREATEST(public.game_marks.count, EXCLUDED.count), updated_at = now();
DELETE FROM public.game_marks WHERE user_id = 'cf7926d7-e70c-45ad-b081-532bac4c7de0';

INSERT INTO public.game_notes (user_id, service, game_id, note, updated_at)
SELECT '0bab9c36-55ac-4572-a2d4-98b3a73550ca', service, game_id, note, updated_at
FROM public.game_notes WHERE user_id = 'cf7926d7-e70c-45ad-b081-532bac4c7de0'
ON CONFLICT (user_id, service, game_id) DO UPDATE
  SET note = CASE WHEN length(EXCLUDED.note) > length(public.game_notes.note) THEN EXCLUDED.note ELSE public.game_notes.note END,
      updated_at = now();
DELETE FROM public.game_notes WHERE user_id = 'cf7926d7-e70c-45ad-b081-532bac4c7de0';

UPDATE public.toy_entries SET user_id = '0bab9c36-55ac-4572-a2d4-98b3a73550ca'
WHERE user_id = 'cf7926d7-e70c-45ad-b081-532bac4c7de0';