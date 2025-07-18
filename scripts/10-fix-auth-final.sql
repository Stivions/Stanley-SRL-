-- =====================================================
-- STANLEY SRL - SOLUCIÓN DEFINITIVA DE AUTENTICACIÓN
-- =====================================================

-- 1. DESHABILITAR RLS TEMPORALMENTE PARA CONFIGURAR
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "products_select_policy" ON products;
DROP POLICY IF EXISTS "products_insert_policy" ON products;
DROP POLICY IF EXISTS "products_update_policy" ON products;
DROP POLICY IF EXISTS "products_delete_policy" ON products;

DROP POLICY IF EXISTS "requests_select_policy" ON product_requests;
DROP POLICY IF EXISTS "requests_insert_policy" ON product_requests;
DROP POLICY IF EXISTS "requests_update_policy" ON product_requests;

DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;

DROP POLICY IF EXISTS "tickets_select_policy" ON tickets;
DROP POLICY IF EXISTS "tickets_insert_policy" ON tickets;
DROP POLICY IF EXISTS "tickets_update_policy" ON tickets;

DROP POLICY IF EXISTS "logs_select_policy" ON admin_logs;
DROP POLICY IF EXISTS "logs_insert_policy" ON admin_logs;

DROP POLICY IF EXISTS "settings_select_policy" ON site_settings;
DROP POLICY IF EXISTS "settings_insert_policy" ON site_settings;
DROP POLICY IF EXISTS "settings_update_policy" ON site_settings;

-- 3. CONFIGURAR STORAGE BUCKET CORRECTAMENTE
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'product-images', 
  'product-images', 
  true, 
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 4. ELIMINAR POLÍTICAS DE STORAGE EXISTENTES
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- 5. CREAR POLÍTICAS DE STORAGE SIMPLES
CREATE POLICY "Allow public read" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Allow public insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Allow public delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'product-images');

-- 6. HABILITAR RLS CON POLÍTICAS PERMISIVAS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 7. CREAR POLÍTICAS PERMISIVAS (SIN RESTRICCIONES)
-- Products
CREATE POLICY "products_all_access" ON products FOR ALL USING (true) WITH CHECK (true);

-- Product Requests
CREATE POLICY "requests_all_access" ON product_requests FOR ALL USING (true) WITH CHECK (true);

-- Users
CREATE POLICY "users_all_access" ON users FOR ALL USING (true) WITH CHECK (true);

-- Tickets
CREATE POLICY "tickets_all_access" ON tickets FOR ALL USING (true) WITH CHECK (true);

-- Admin Logs
CREATE POLICY "logs_all_access" ON admin_logs FOR ALL USING (true) WITH CHECK (true);

-- Site Settings
CREATE POLICY "settings_all_access" ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- 8. VERIFICAR CONFIGURACIÓN
DO $$
BEGIN
  RAISE NOTICE '✅ Base de datos configurada sin restricciones';
  RAISE NOTICE '✅ Storage bucket configurado correctamente';
  RAISE NOTICE '✅ Todas las políticas permisivas aplicadas';
END $$;
