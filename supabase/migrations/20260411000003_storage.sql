-- ============================================================
-- Supabase Storage: Product & Workshop Images
-- ============================================================

-- Bucket для изображений продуктов и мастер-классов
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  5242880,  -- 5MB (как было в multer)
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Все могут читать изображения (bucket публичный)
create policy "Images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'images');

-- Только админ может загружать изображения
create policy "Admins can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and public.is_admin()
  );

-- Только админ может обновлять изображения
create policy "Admins can update images"
  on storage.objects for update
  using (
    bucket_id = 'images'
    and public.is_admin()
  );

-- Только админ может удалять изображения
create policy "Admins can delete images"
  on storage.objects for delete
  using (
    bucket_id = 'images'
    and public.is_admin()
  );
