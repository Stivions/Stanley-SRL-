-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_requests_updated_at 
    BEFORE UPDATE ON product_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON tickets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at 
    BEFORE UPDATE ON site_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIÓN PARA LOGGING DE ADMIN
-- =====================================================

CREATE OR REPLACE FUNCTION log_admin_action(
    p_action VARCHAR(100),
    p_table_name VARCHAR(50),
    p_record_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO admin_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        p_action,
        p_table_name,
        p_record_id,
        p_old_values,
        p_new_values,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN PARA ESTADÍSTICAS DEL DASHBOARD
-- =====================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_products', (SELECT COUNT(*) FROM products WHERE active = true),
        'featured_products', (SELECT COUNT(*) FROM products WHERE featured = true AND active = true),
        'total_requests', (SELECT COUNT(*) FROM product_requests),
        'pending_requests', (SELECT COUNT(*) FROM product_requests WHERE status = 'pending'),
        'total_tickets', (SELECT COUNT(*) FROM tickets),
        'open_tickets', (SELECT COUNT(*) FROM tickets WHERE status = 'open'),
        'recent_requests', (
            SELECT json_agg(
                json_build_object(
                    'id', pr.id,
                    'customer_name', pr.customer_name,
                    'product_name', p.name,
                    'created_at', pr.created_at
                )
            )
            FROM product_requests pr
            JOIN products p ON pr.product_id = p.id
            ORDER BY pr.created_at DESC
            LIMIT 5
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
