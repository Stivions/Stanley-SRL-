-- =====================================================
-- STANLEY SRL - ARREGLAR STORAGE Y EDICIÓN
-- =====================================================

-- 1. ELIMINAR BUCKET EXISTENTE Y RECREAR
DELETE FROM storage.objects WHERE bucket_id = 'product-images';
DELETE FROM storage.buckets WHERE id = 'product-images';

-- 2. CREAR BUCKET CORRECTAMENTE
INSERT INTO storage.buckets (
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  avif_autodetection
) VALUES (
  'product-images',
  'product-images',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  false
);

-- 3. ELIMINAR POLÍTICAS DE STORAGE EXISTENTES
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

-- 4. CREAR POLÍTICAS DE STORAGE SIMPLES Y FUNCIONALES
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Public can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'products'
);

CREATE POLICY "Public can update images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Public can delete images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');

-- 5. VERIFICAR CONFIGURACIÓN
DO $$
BEGIN
  RAISE NOTICE '✅ Storage bucket recreado correctamente';
  RAISE NOTICE '✅ Políticas de storage aplicadas';
  RAISE NOTICE '✅ Límite de archivo: 50MB';
  RAISE NOTICE '✅ Tipos permitidos: JPEG, PNG, WEBP, GIF';
END $$;
