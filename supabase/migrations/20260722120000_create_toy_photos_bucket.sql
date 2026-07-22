
-- Приватный bucket для фото игрушек (страница /toys).
-- Политики доступа к storage.objects для него уже созданы в предыдущей миграции.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'toy-photos',
  'toy-photos',
  false,
  10485760, -- 10 МБ на файл
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;
