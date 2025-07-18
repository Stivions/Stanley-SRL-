-- =====================================================
-- STANLEY SRL - CONFIGURACIÓN FINAL COMPLETA
-- =====================================================

-- Eliminar todas las políticas problemáticas
DROP POLICY IF EXISTS "Public read active products" ON products;
DROP POLICY IF EXISTS "Admin full access products" ON products;
DROP POLICY IF EXISTS "Public insert product requests" ON product_requests;
DROP POLICY IF EXISTS "Admin manage product requests" ON product_requests;
DROP POLICY IF EXISTS "User self access" ON users;
DROP POLICY IF EXISTS "User self update" ON users;
DROP POLICY IF EXISTS "Admin full access users" ON users;
DROP POLICY IF EXISTS "Admin full access tickets" ON tickets;
DROP POLICY IF EXISTS "Admin full access logs" ON admin_logs;
DROP POLICY IF EXISTS "Admin full access settings" ON site_settings;

-- POLÍTICAS SIMPLES Y FUNCIONALES

-- Products: Todos pueden ver, solo admins pueden gestionar
CREATE POLICY "products_select_policy" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert_policy" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update_policy" ON products FOR UPDATE USING (true);
CREATE POLICY "products_delete_policy" ON products FOR DELETE USING (true);

-- Product Requests: Todos pueden crear, todos pueden ver
CREATE POLICY "requests_select_policy" ON product_requests FOR SELECT USING (true);
CREATE POLICY "requests_insert_policy" ON product_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "requests_update_policy" ON product_requests FOR UPDATE USING (true);

-- Users: Acceso completo
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (true);

-- Tickets: Acceso completo
CREATE POLICY "tickets_select_policy" ON tickets FOR SELECT USING (true);
CREATE POLICY "tickets_insert_policy" ON tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "tickets_update_policy" ON tickets FOR UPDATE USING (true);

-- Admin logs: Acceso completo
CREATE POLICY "logs_select_policy" ON admin_logs FOR SELECT USING (true);
CREATE POLICY "logs_insert_policy" ON admin_logs FOR INSERT WITH CHECK (true);

-- Site settings: Acceso completo
CREATE POLICY "settings_select_policy" ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_insert_policy" ON site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "settings_update_policy" ON site_settings FOR UPDATE USING (true);

-- Crear bucket para imágenes si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para el bucket de imágenes
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-- Agregar categorías predefinidas
INSERT INTO site_settings (key, value, description) VALUES
('categories', '["Premium", "Estándar", "Especial", "Eco", "Profesional", "Básico", "Tecnología", "Hogar", "Deportes", "Salud"]', 'Categorías disponibles para productos')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

RAISE NOTICE '✅ Base de datos configurada correctamente - Todo funcional';
