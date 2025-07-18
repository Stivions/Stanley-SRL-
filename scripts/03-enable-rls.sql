-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURIDAD PARA PRODUCTS
-- =====================================================

-- Cualquiera puede ver productos activos
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT 
    USING (active = true);

-- Solo admins pueden gestionar productos
CREATE POLICY "Admins can manage products" ON products
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.active = true
        )
    );

-- =====================================================
-- POLÍTICAS DE SEGURIDAD PARA PRODUCT_REQUESTS
-- =====================================================

-- Cualquiera puede crear solicitudes
CREATE POLICY "Anyone can create product requests" ON product_requests
    FOR INSERT 
    WITH CHECK (true);

-- Solo admins pueden ver todas las solicitudes
CREATE POLICY "Admins can view all requests" ON product_requests
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.active = true
        )
    );

-- Solo admins pueden actualizar solicitudes
CREATE POLICY "Admins can update requests" ON product_requests
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.active = true
        )
    );

-- =====================================================
-- POLÍTICAS DE SEGURIDAD PARA USERS
-- =====================================================

-- Los usuarios pueden ver su propia información
CREATE POLICY "Users can view own data" ON users
    FOR SELECT 
    USING (auth.uid() = id);

-- Solo admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.active = true
        )
    );

-- Solo admins pueden gestionar usuarios
CREATE POLICY "Admins can manage users" ON users
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.active = true
        )
    );

-- =====================================================
-- POLÍTICAS DE SEGURIDAD PARA TICKETS
-- =====================================================

-- Solo admins pueden gestionar tickets
CREATE POLICY "Admins can manage tickets" ON tickets
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.active = true
        )
    );

-- =====================================================
-- POLÍTICAS DE SEGURIDAD PARA ADMIN_LOGS
-- =====================================================

-- Solo admins pueden ver logs
CREATE POLICY "Admins can view logs" ON admin_logs
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.active = true
        )
    );

-- =====================================================
-- POLÍTICAS DE SEGURIDAD PARA SITE_SETTINGS
-- =====================================================

-- Solo admins pueden gestionar configuraciones
CREATE POLICY "Admins can manage settings" ON site_settings
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.active = true
        )
    );
