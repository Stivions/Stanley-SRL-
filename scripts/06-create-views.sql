-- =====================================================
-- VISTAS PARA REPORTES Y CONSULTAS
-- =====================================================

-- Vista para productos con estadísticas
CREATE OR REPLACE VIEW products_with_stats AS
SELECT 
    p.*,
    COUNT(pr.id) as request_count,
    COUNT(pr.id) FILTER (WHERE pr.status = 'pending') as pending_requests,
    MAX(pr.created_at) as last_request_date
FROM products p
LEFT JOIN product_requests pr ON p.id = pr.product_id
WHERE p.active = true
GROUP BY p.id, p.name, p.description, p.image, p.category, p.featured, 
         p.stripe_product_id, p.price, p.currency, p.active, p.created_at, p.updated_at;

-- Vista para solicitudes con información del producto
CREATE OR REPLACE VIEW requests_with_product_info AS
SELECT 
    pr.*,
    p.name as product_name,
    p.category as product_category,
    p.image as product_image
FROM product_requests pr
JOIN products p ON pr.product_id = p.id
ORDER BY pr.created_at DESC;

-- Vista para estadísticas de tickets
CREATE OR REPLACE VIEW ticket_stats AS
SELECT 
    status,
    priority,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_resolution_hours
FROM tickets
WHERE resolved_at IS NOT NULL
GROUP BY status, priority;

-- Vista para actividad reciente
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
    'product_request' as activity_type,
    pr.id,
    pr.customer_name as actor,
    'Nueva solicitud para ' || p.name as description,
    pr.created_at
FROM product_requests pr
JOIN products p ON pr.product_id = p.id
UNION ALL
SELECT 
    'ticket' as activity_type,
    t.id,
    t.customer_name as actor,
    'Nuevo ticket: ' || t.title as description,
    t.created_at
FROM tickets t
ORDER BY created_at DESC
LIMIT 20;
