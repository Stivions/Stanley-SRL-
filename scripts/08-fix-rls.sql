-- =============================================================
-- FIX   : Infinite-Recursion in RLS Policies
-- Autor : Stivion
-- Fecha : 2025-07-16
-- =============================================================

-- Helper para leer claims del JWT
CREATE OR REPLACE FUNCTION current_jwt_claim(claim TEXT)
RETURNS TEXT
LANGUAGE sql STABLE PARALLEL SAFE AS $$
SELECT
  (current_setting('request.jwt.claims', true)::json ->> claim)
$$;

-- Emails que consideramos administradores (puedes cambiar la lista)
CREATE OR REPLACE FUNCTION is_admin_email(email TEXT)
RETURNS BOOLEAN
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
SELECT email = ANY (ARRAY[
  'admin@stanley.com',
  'stivion@stanley.com'
])
$$;

-- ===================================================================
-- 1. PRODUCTS
-- ===================================================================
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Anyone can view active products"   ON products;

-- Cualquier visitante ve productos activos
CREATE POLICY "Public read active products"
ON products
FOR SELECT
USING (active);

-- Solo admins gestionan productos
CREATE POLICY "Admin full access products"
ON products
FOR ALL
USING ( is_admin_email(current_jwt_claim('email')) );

-- ===================================================================
-- 2. PRODUCT_REQUESTS
-- ===================================================================
DROP POLICY IF EXISTS "Anyone can create product requests" ON product_requests;
DROP POLICY IF EXISTS "Admins can view all requests"       ON product_requests;
DROP POLICY IF EXISTS "Admins can update requests"         ON product_requests;

-- Cualquier usuario puede insertar una solicitud
CREATE POLICY "Public insert product requests"
ON product_requests
FOR INSERT
WITH CHECK (true);

-- Admins leen / actualizan / eliminan
CREATE POLICY "Admin manage product requests"
ON product_requests
FOR ALL
USING ( is_admin_email(current_jwt_claim('email')) );

-- ===================================================================
-- 3. USERS
-- ===================================================================
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage users"   ON users;

-- Cada user ve y actualiza su propio registro (no recursivo)
CREATE POLICY "User self access"
ON users
FOR SELECT USING ( id = auth.uid() )
;
CREATE POLICY "User self update"
ON users
FOR UPDATE USING ( id = auth.uid() )
WITH CHECK ( id = auth.uid() )
;

-- Admins pueden todo sin consultar users de nuevo
CREATE POLICY "Admin full access users"
ON users
FOR ALL
USING ( is_admin_email(current_jwt_claim('email')) );

-- ===================================================================
-- 4. TICKETS
-- ===================================================================
DROP POLICY IF EXISTS "Admin can manage tickets" ON tickets;

CREATE POLICY "Admin full access tickets"
ON tickets
FOR ALL
USING ( is_admin_email(current_jwt_claim('email')) );

-- ===================================================================
-- 5. ADMIN_LOGS  &  SITE_SETTINGS
-- ===================================================================
DROP POLICY IF EXISTS "Admins can view logs"      ON admin_logs;
DROP POLICY IF EXISTS "Admins can manage settings" ON site_settings;

CREATE POLICY "Admin full access logs"
ON admin_logs
FOR ALL
USING ( is_admin_email(current_jwt_claim('email')) );

CREATE POLICY "Admin full access settings"
ON site_settings
FOR ALL
USING ( is_admin_email(current_jwt_claim('email')) );

-- =============================================================
-- 6. VERIFICACIÓN RÁPIDA
-- =============================================================
DO $$
BEGIN
  RAISE NOTICE '✅  Policies updated – recursion-free.';
END $$;
